import { MapRef } from "react-map-gl";
import * as turf from "@turf/turf"; // Geospatial calculations
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { Position } from "geojson";



interface UseMapFeaturesProps {
  mapRef: React.MutableRefObject<MapRef | null>;
  azimuthsRef: React.MutableRefObject<GeoJSON.Feature<GeoJSON.Point>[]>;
}



function useMapFeatures({ mapRef, azimuthsRef }: UseMapFeaturesProps) {
  const AZIMUTH_LAYER_ID = "azimuth-labels";

  // Returns the current Mapbox map instance
  function getMap() { return mapRef.current?.getMap(); }

  // Calculates the length of a given line and logs it
  function calculateLineLength(geometry: GeoJSON.LineString) {
    const feature: GeoJSON.Feature<GeoJSON.LineString> = { type: "Feature", geometry, properties: {} };
    const lengthInKm = turf.length(feature, { units: "kilometers" });
    return lengthInKm;
  };

  // Draws line from coords on map
  function drawLineProgrammatically(coords: number[][], draw: MapboxDraw) {
    if (!draw || coords.length < 2) return;
    const lineFeature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: {},
    };
    draw.add(lineFeature);
  }

  function getLineMidpoints(coords: Position[]) {
    const newAzimuths = coords
      .slice(0, -1) //remove last coord (no need to show azm. for last point)
      .map((coord, i) => {
        const midpoint = turf.midpoint(turf.point(coord), turf.point(coords[i + 1]));
        return {
          type: "Feature",
          geometry: midpoint.geometry,
          properties: { azimuth: `${turf.bearing(turf.point(coord), turf.point(coords[i + 1])).toFixed(1)}°` },
        };
      });
    return newAzimuths;
  }

  // Draws azimuth labels at the midpoint between each pair of consecutive points 
  function createAzimuths(geometry: GeoJSON.LineString) {
    const map = getMap();
    if (!map || geometry.coordinates.length < 2) return console.log("Not enough points to draw azimuths.");
    const newAzimuths = getLineMidpoints(geometry.coordinates);
    azimuthsRef.current = newAzimuths as GeoJSON.Feature<GeoJSON.Point>[];
    updateAzimuthLayer();
  };

  // Updates or removes the azimuth layer
  function updateAzimuthLayer() {
    const map = getMap();
    if (!map) return;
    const hasAzimuths = azimuthsRef.current.length > 0;
    const sourceExists = Boolean(map.getSource(AZIMUTH_LAYER_ID));
    const layerExists = Boolean(map.getLayer(AZIMUTH_LAYER_ID));
    const sourceData: GeoJSON.FeatureCollection<GeoJSON.Point> = { type: "FeatureCollection", features: azimuthsRef.current };
    if (!hasAzimuths) { removeAzimuthLayer(map, layerExists, sourceExists); return; }
    if (sourceExists) setAzimuthLayer(map, sourceData);
    else addAzimuthLayer(map, sourceData);
  };
  
  // Helper to remove the azimuth layer
  function removeAzimuthLayer(map: mapboxgl.Map, layerExists: boolean, sourceExists: boolean) {
    if (layerExists) map.removeLayer(AZIMUTH_LAYER_ID);
    if (sourceExists) map.removeSource(AZIMUTH_LAYER_ID);
  };

  // Helper to set new azimuth layer data
  function setAzimuthLayer(map: mapboxgl.Map, sourceData: GeoJSON.FeatureCollection<GeoJSON.Point>) {
    (map.getSource(AZIMUTH_LAYER_ID) as mapboxgl.GeoJSONSource).setData(sourceData)
  }
  
  // Helper to add the azimuth layer
  function addAzimuthLayer(map: mapboxgl.Map, sourceData: GeoJSON.FeatureCollection<GeoJSON.Point>) {
    map.addSource(AZIMUTH_LAYER_ID, { type: "geojson", data: sourceData });
    map.addLayer({
      id: AZIMUTH_LAYER_ID,
      type: "symbol",
      source: AZIMUTH_LAYER_ID,
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
  };
  
  // Expose functions
  return { calculateLineLength, drawLineProgrammatically, createAzimuths, updateAzimuthLayer };
};

export default useMapFeatures;
