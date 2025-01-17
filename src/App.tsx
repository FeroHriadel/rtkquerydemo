import { useEffect, useRef, useState, useCallback } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import useMapCalcs from "./hooks/useMapCalcs"; // Geospatial calculations

function App() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const initialViewState = { latitude: 49.212132, longitude: 16.598509, zoom: 14 };
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const mapRef = useRef<MapRef | null>(null);
  const azimuthFeaturesRef = useRef<GeoJSON.Feature<GeoJSON.Point>[]>([]);
  const { calculateLineLength, calculateAzimuths, drawAzimuths, updateAzimuthLayer } = useMapCalcs({ mapRef, azimuthFeaturesRef });


  const onMapLoad = () => setMapLoaded(true);
  const getMap = () => mapRef.current?.getMap();

  // Initializes the drawing controls
  const initDraw = () => new MapboxDraw({
    displayControlsDefault: false,
    controls: { line_string: true, trash: true },
  });

  // Adds the draw controls to the map
  const addDrawToMap = (map: mapboxgl.Map, draw: MapboxDraw) => {
    if (!map.isStyleLoaded()) {
      map.on("load", () => map.addControl(draw));
    } else {
      map.addControl(draw);
    }
  };

  // Clears any previous azimuths
  const clearAzimuths = () => {
    azimuthFeaturesRef.current = [];
  };

  // Remove all drawn lines, keeping the last one if more than one exists
  const removeDrawings = (draw: MapboxDraw) => {
    const allFeatures = draw.getAll();
    if (allFeatures.features.length > 1) {
      draw.delete(allFeatures.features[0].id as string);
    }
  };

  // Event handlers for draw actions
  const onDrawCreate = useCallback(
    (event: { features: GeoJSON.Feature<GeoJSON.Geometry>[] }, draw: MapboxDraw) => {
      removeDrawings(draw);
      const feature = event.features[0];
      if (feature && feature.geometry.type === "LineString") {
        clearAzimuths();
        calculateLineLength(feature.geometry);
        drawAzimuths(feature.geometry);
      }
    },
    [calculateLineLength, drawAzimuths]
  );

  const onDrawUpdate = useCallback(
    (event: { features: GeoJSON.Feature<GeoJSON.Geometry>[] }) => {
      const feature = event.features[0];
      if (feature && feature.geometry.type === "LineString") {
        clearAzimuths();
        calculateLineLength(feature.geometry);
        calculateAzimuths(feature.geometry);
        drawAzimuths(feature.geometry);
      }
    },
    [calculateLineLength, calculateAzimuths, drawAzimuths]
  );

  const onDrawDelete = useCallback(() => {
    clearAzimuths();
    updateAzimuthLayer();
  }, [updateAzimuthLayer]);

  const addDrawListeners = useCallback(
    (map: mapboxgl.Map, draw: MapboxDraw) => {
      map.on("draw.create", (event) => onDrawCreate(event, draw));
      map.on("draw.update", onDrawUpdate);
      map.on("draw.delete", onDrawDelete);
    },
    [onDrawCreate, onDrawUpdate, onDrawDelete]
  );


  useEffect(() => {
    if (!mapLoaded) return;
    const map = getMap();
    const draw = initDraw();
    addDrawToMap(map!, draw);
    addDrawListeners(map!, draw);
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
