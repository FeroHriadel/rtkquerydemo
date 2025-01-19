import { useEffect, useRef, useState } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import useMapFeatures from "./hooks/useMapFeatures"; // geospatial calculations
import LineInfo from "./components/LineInfo";
import LineForm from "./components/LineForm";



function App() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const initialViewState = { latitude: 49.212132, longitude: 16.598509, zoom: 14 };
  const [mapLoaded, setMapLoaded] = useState(false);
  const drawRef = useRef<MapboxDraw | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const azimuthsRef = useRef<GeoJSON.Feature<GeoJSON.Point>[]>([]);
  const { calculateLineLength, drawLineProgrammatically, createAzimuths, updateAzimuthLayer } = useMapFeatures({ mapRef, azimuthsRef });
  const [lineLength, setLineLength] = useState(0);
  const [lineCoords, setLineCoords] = useState<number[][]>([]);

  // Marks map as loaded
  function onMapLoad() {
    setMapLoaded(true);
  }

  // Retrieves the current Mapbox instance
  function getMap() {
    return mapRef.current?.getMap();
  }

  // Initializes the Mapbox Draw tool
  function initDraw() {
    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: { line_string: true, trash: true },
    });
  }

  // Adds the Draw tool to the map
  function addDrawToMap(map: mapboxgl.Map, draw: MapboxDraw) {
    if (!map.isStyleLoaded()) {
      map.on("load", () => map.addControl(draw));
    } else {
      map.addControl(draw);
    }
  }

  // Clears stored azimuth calculations
  function clearAzimuths() {
    azimuthsRef.current = [];
  }

  // Scroll map to coords
  function scrollMapTo(coord: { lng: number; lat: number }) {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.flyTo({
      center: [coord.lng, coord.lat],
      essential: true,
      zoom: map.getZoom(),
    });
  }

  // Removes the previous drawn line if a new one is added
  function removePreviousLine() {
    const allFeatures = drawRef.current!.getAll();
    if (allFeatures.features.length > 1) {
      drawRef.current!.delete(allFeatures.features[0].id as string);
    }
  }

  // Set lineLength from [lmg, lat] array
  function setLineLengthFromCoords(coords: number[][]) {
    const geometry: GeoJSON.LineString = { type: "LineString", coordinates: coords };
    const length = calculateLineLength(geometry);
    setLineLength(length);
  }

  // Create azimuths from [lng, lat] array
  function createAzimuthsFromCoords(coords: number[][]) {
    const geometry: GeoJSON.LineString = { type: "LineString", coordinates: coords };
    createAzimuths(geometry);
  }

  // Draws new line from coords
  function createLine(coords: number[][]) {
    if (!drawRef.current || coords?.length < 2) return;
    clearMap();
    drawLineProgrammatically(coords, drawRef.current);
    setLineLengthFromCoords(coords);
    setLineCoords(coords);
    createAzimuthsFromCoords(coords);
    scrollMapTo({lng: coords[0][0], lat: coords[0][1]});
  }

  // Handles creation of a new line on the map
  function onDrawCreate(event: { features: GeoJSON.Feature<GeoJSON.Geometry>[] }) {
    removePreviousLine();
    const feature = event.features[0];
    if (feature && feature.geometry.type === "LineString") {
      setLineLength(calculateLineLength(feature.geometry));
      clearAzimuths();
      createAzimuths(feature.geometry);
      setLineCoords(feature.geometry.coordinates);
    }
  }

  // Handles updates when a drawn line is modified
  function onDrawUpdate(event: { features: GeoJSON.Feature<GeoJSON.Geometry>[] }) {
    const feature = event.features[0];
    if (feature && feature.geometry.type === "LineString") {
      setLineLength(calculateLineLength(feature.geometry));
      clearAzimuths();
      createAzimuths(feature.geometry);
      setLineCoords(feature.geometry.coordinates);
    }
  }

  // Adds event listeners for drawing actions
  function addDrawListeners(map: mapboxgl.Map) {
    map.on("draw.create", onDrawCreate);
    map.on("draw.update", onDrawUpdate);
    //map.on("draw.delete", onDrawDelete); => MapboxDraw trash btn was buggy, 'twas replaced by maskTrashButton() and clearMap()
  }

  // Creates an overlay over the trash button to customize delete behavior
  function maskTrashButton(deleteLineBtn: HTMLElement) {
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

  // Clears all drawn lines and resets values
  function clearMap() {
    if (drawRef.current) {
      setLineLength(0);
      setLineCoords([]);
      drawRef.current.deleteAll();
      clearAzimuths();
      updateAzimuthLayer();
    }
  }

  // Initializes map and drawing tool when map is loaded
  useEffect(() => {
    if (!mapLoaded) return;
    const map = getMap();
    initDraw();
    addDrawToMap(map!, drawRef.current!);
    addDrawListeners(map!);
    return () => {
      if (map) map.removeControl(drawRef.current!);
    };
  }, [mapLoaded]);

  // Customizes delete button behavior
  useEffect(() => {
    if (!mapLoaded) return;
    const deleteLineBtn = document.querySelector(".mapbox-gl-draw_trash") as HTMLElement;
    if (!deleteLineBtn) return;
    const overlayDiv = maskTrashButton(deleteLineBtn);
    overlayDiv.addEventListener("click", clearMap);
    return () => {
      overlayDiv.removeEventListener("click", clearMap);
      document.body.removeChild(overlayDiv);
    };
  }, [mapLoaded]);

  // Render on screen
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <main id="map-container" className="h-[500px] max-w-[1000px] w-[95%] bg-slate-50">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onLoad={onMapLoad}
        >
          <NavigationControl position="top-right" />
        </Map>
      </main>

      <section className="max-w-[1000px] w-[95%]">
        <LineInfo lineCoords={lineCoords} lineLength={lineLength} />
      </section>

      <LineForm lineCoords={lineCoords} onSubmit={createLine} />
    </div>
  );
}

export default App;