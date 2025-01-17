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
  const drawRef = useRef<MapboxDraw | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const azimuthFeaturesRef = useRef<GeoJSON.Feature<GeoJSON.Point>[]>([]);
  const { calculateLineLength, calculateAzimuths, drawAzimuths, updateAzimuthLayer } = useMapCalcs({ mapRef, azimuthFeaturesRef });


  const onMapLoad = () => setMapLoaded(true);
  const getMap = () => mapRef.current?.getMap();

  // Initializes the drawing controls
  const initDraw = () => drawRef.current = new MapboxDraw({
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
  const clearAzimuths = useCallback(() => {
    azimuthFeaturesRef.current = [];
  }, []);
  

  // Remove all drawn lines, keeping the last one if more than one exists
  const removeDrawings = () => {
    const allFeatures = drawRef.current!.getAll();
    if (allFeatures.features.length > 1) {
      drawRef.current!.delete(allFeatures.features[0].id as string);
    }
  };

  // Event handlers for draw actions
  const onDrawCreate = useCallback(
    (event: { features: GeoJSON.Feature<GeoJSON.Geometry>[] }) => {
      removeDrawings();
      const feature = event.features[0];
      if (feature && feature.geometry.type === "LineString") {
        clearAzimuths();
        calculateLineLength(feature.geometry);
        drawAzimuths(feature.geometry);
      }
    },
    [calculateLineLength, drawAzimuths, clearAzimuths]
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

  const addDrawListeners = useCallback(
    (map: mapboxgl.Map) => {
      map.on("draw.create", (event) => onDrawCreate(event));
      map.on("draw.update", onDrawUpdate);
      // map.on("draw.delete", clearAzimuths);  =>  trash button malfunctioned, I overode it in maskTrashButton and clearMap
    },
    [onDrawCreate, onDrawUpdate]
  );

  // Create a new invisible element over the trash button
  const maskTrashButton = (deleteLineBtn: HTMLElement) => {
    const overlayDiv = document.createElement("div");
      overlayDiv.style.position = "absolute";
      overlayDiv.style.top = `${deleteLineBtn.getBoundingClientRect().top}px`;
      overlayDiv.style.left = `${deleteLineBtn.getBoundingClientRect().left}px`;
      overlayDiv.style.width = `${deleteLineBtn.offsetWidth}px`;
      overlayDiv.style.height = `${deleteLineBtn.offsetHeight}px`;
      overlayDiv.style.backgroundColor = "transparent";
      overlayDiv.style.zIndex = "999";
      document.body.appendChild(overlayDiv);
      return overlayDiv;
  }

  //Remove everything painted in map
  const clearMap = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      clearAzimuths();
      updateAzimuthLayer();
    }
  }, [clearAzimuths, updateAzimuthLayer]);
 

  // Init MapboxDraw
  useEffect(() => {
    if (!mapLoaded) return;
    const map = getMap();
    initDraw();
    addDrawToMap(map!, drawRef.current!);
    addDrawListeners(map!);
    return () => {
      if (map) map.removeControl(drawRef.current!);
    };
  }, [mapLoaded, addDrawListeners]);

  // Overide MapboxDraw trash button
  useEffect(() => {
    if (!mapLoaded) return;
    const deleteLineBtn = document.querySelector(".mapbox-gl-draw_trash") as HTMLElement;
    if (!deleteLineBtn) return;
    const overlayDiv = maskTrashButton(deleteLineBtn);
    overlayDiv.addEventListener("click", clearMap);
    return () => { overlayDiv.removeEventListener("click", clearMap); document.body.removeChild(overlayDiv); }
  }, [mapLoaded, clearMap]);


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
