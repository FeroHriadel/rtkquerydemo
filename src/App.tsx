import { useEffect, useRef, useState, useCallback } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw"; //line drawing controls for mapbox
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf"; //geospatial calculations



function App() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const brnoCoords = { lat: 49.212132, lng: 16.598509 };
  const initialViewState = { latitude: brnoCoords.lat, longitude: brnoCoords.lng, zoom: 14 };
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const azimuthFeaturesRef = useRef<GeoJSON.Feature<GeoJSON.Point>[]>([]);


  function onMapLoad() {
    setMapLoaded(true);
  }

  function getMap() {
    return mapRef.current?.getMap();
  }

  function initDraw() {
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true,
      },
    });
    return draw;
  }

  function addDrawToMap(map: mapboxgl.Map, draw: MapboxDraw) {
    if (!map.isStyleLoaded()) {
      map.on("load", () => {
        map.addControl(draw);
      });
    } else {
      map.addControl(draw);
    }
  }

  const addDrawListeners = useCallback(
    (map: mapboxgl.Map) => {
      map!.on("draw.create", (event: { features: GeoJSON.Feature<GeoJSON.Geometry>[] }) => {
        const feature = event.features[0]; // [0] gets the newly created feature
        if (feature && feature.geometry.type === "LineString") {
          calculateLineLength(feature.geometry);
          drawAzimuths(feature.geometry);
        }
      });
  
      map!.on("draw.update", (event: { features: GeoJSON.Feature<GeoJSON.Geometry>[] }) => {
        const feature = event.features[0]; // [0] gets the updated feature
        if (feature && feature.geometry.type === "LineString") {
          calculateLineLength(feature.geometry);
          calculateAzimuths(feature.geometry);
          drawAzimuths(feature.geometry);
        }
      });
    },
    []
  );
  
  function calculateLineLength(geometry: GeoJSON.LineString) { //calculate the length of the line in kilometers
    const feature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      geometry: geometry,
      properties: {}
    };
    const lengthInKm = turf.length(feature, { units: 'kilometers' });
    console.log("Line Length in km:", lengthInKm);
  }

  function calculateAzimuths(geometry: GeoJSON.LineString) { //calculate azimuths between lines
    const coordinates = geometry.coordinates;
    if (coordinates.length < 2) {
      console.log("Not enough points to calculate azimuth.");
      return;
    }
    const azimuths: number[] = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const point1 = turf.point(coordinates[i]);
      const point2 = turf.point(coordinates[i + 1]);
      const azimuth = turf.bearing(point1, point2);
      azimuths.push(azimuth);
      console.log(`Azimuth between point ${i} and ${i + 1}:`, azimuth, "°");
    }
    return azimuths;
  }

  function drawAzimuths(geometry: GeoJSON.LineString) {
    const map = getMap();
    if (!map) return;
    const coordinates = geometry.coordinates;
    if (coordinates.length < 2) {
      console.log("Not enough points to draw azimuths.");
      return;
    }
    const newAzimuthFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const point1 = turf.point(coordinates[i]);
      const point2 = turf.point(coordinates[i + 1]);
      const azimuth = turf.bearing(point1, point2);
      const midpoint = turf.midpoint(point1, point2);
      newAzimuthFeatures.push({
        type: "Feature",
        geometry: midpoint.geometry,
        properties: { azimuth: `${azimuth.toFixed(1)}°` },
      });
    }
    azimuthFeaturesRef.current = [...azimuthFeaturesRef.current, ...newAzimuthFeatures];
    updateAzimuthLayer();
  }
  
  function updateAzimuthLayer() {
    const map = getMap();
    if (!map) return;
    const azimuthLayerId = "azimuth-labels";
    if (map.getSource(azimuthLayerId)) {
      (map.getSource(azimuthLayerId) as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: azimuthFeaturesRef.current,
      });
    } else {
      map.addSource(azimuthLayerId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: azimuthFeaturesRef.current,
        },
      });
      map.addLayer({
        id: azimuthLayerId,
        type: "symbol",
        source: azimuthLayerId,
        layout: {
          "text-field": ["get", "azimuth"],
          "text-size": 14,
          "text-anchor": "center",
          "text-offset": [0, 0],
        },
        paint: {
          "text-color": "#ff0000",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      });
    }
  }
  
  


  useEffect(() => { //add draw after the map is loaded
    if (!mapLoaded) return;
    const map = getMap();
    const draw = initDraw();
    addDrawToMap(map!, draw);
    addDrawListeners(map!);
    return () => {
      if (map) map.removeControl(draw);
    };
  }, [mapLoaded, addDrawListeners]); 


  return (
    <div className="flex justify-center items-center h-screen">
      <div id="map-container" className="h-[500px] max-w-[1000px] w-[95%] bg-slate-50">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onLoad={onMapLoad}
        >
          <NavigationControl position="top-right" />
        </Map>
      </div>
    </div>
  );
}

export default App;
