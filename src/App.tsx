import { useEffect, useRef, useState } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw"; //line drawing controls for mapbox
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";



function App() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const brnoCoords = { lat: 49.212132, lng: 16.598509 };
  const initialViewState = { latitude: brnoCoords.lat, longitude: brnoCoords.lng, zoom: 14 };
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);


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


  useEffect(() => { //add draw after the map is loaded
    if (!mapLoaded) return;
    const map = getMap();
    const draw = initDraw();
    addDrawToMap(map!, draw);
    return () => {
      if (map) map.removeControl(draw);
    };
  }, [mapLoaded]); 


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
