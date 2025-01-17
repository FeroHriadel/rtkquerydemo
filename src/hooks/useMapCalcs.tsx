import { MapRef } from "react-map-gl";
import * as turf from "@turf/turf"; // Geospatial calculations



interface UseMapCalcsProps {
  mapRef: React.MutableRefObject<MapRef | null>;
  azimuthFeaturesRef: React.MutableRefObject<GeoJSON.Feature<GeoJSON.Point>[]>; // Stores calculated azimuths
}



const useMapCalcs = ({ mapRef, azimuthFeaturesRef }: UseMapCalcsProps) => {
  const AZIMUTH_LAYER_ID = "azimuth-labels";


  // Returns the current Mapbox map instance
  const getMap = () => mapRef.current?.getMap();

  // Calculates the length of a given line and logs it
  const calculateLineLength = (geometry: GeoJSON.LineString) => {
    const feature: GeoJSON.Feature<GeoJSON.LineString> = { type: "Feature", geometry, properties: {} };
    const lengthInKm = turf.length(feature, { units: "kilometers" });
    console.log("Line Length in km:", lengthInKm);
    return lengthInKm;
  };

  // Calculates azimuths between each pair of consecutive points in a line
  const calculateAzimuths = (geometry: GeoJSON.LineString) => {
    if (geometry.coordinates.length < 2) return console.log("Not enough points to calculate azimuth.");
    const azimuths = geometry.coordinates
      .slice(0, -1) //remove last coord (no need to calc azm. for last point)
      .map((coord, i) => { 
        const azimuth = turf.bearing(turf.point(coord), turf.point(geometry.coordinates[i + 1])); //calc azm. for a pair of points
        return azimuth;
      });
    return azimuths;
  };

  // Draws azimuth labels at the midpoint between each pair of consecutive points 
  const drawAzimuths = (geometry: GeoJSON.LineString) => {
    const map = getMap();
    if (!map || geometry.coordinates.length < 2) return console.log("Not enough points to draw azimuths.");
    const newAzimuthFeatures = geometry.coordinates
      .slice(0, -1) //remove last coord (no need to show azm. for last point)
      .map((coord, i) => {
        const midpoint = turf.midpoint(turf.point(coord), turf.point(geometry.coordinates[i + 1]));
        return {
          type: "Feature",
          geometry: midpoint.geometry,
          properties: { azimuth: `${turf.bearing(turf.point(coord), turf.point(geometry.coordinates[i + 1])).toFixed(1)}°` },
        };
      });
    azimuthFeaturesRef.current = newAzimuthFeatures as GeoJSON.Feature<GeoJSON.Point>[];
    updateAzimuthLayer();
  };

  // Updates or removes the azimuth layer
  const updateAzimuthLayer = () => {
    const map = getMap();
    if (!map) return;
    const hasAzimuths = azimuthFeaturesRef.current.length > 0;
    const sourceExists = Boolean(map.getSource(AZIMUTH_LAYER_ID));
    const layerExists = Boolean(map.getLayer(AZIMUTH_LAYER_ID));
    const sourceData: GeoJSON.FeatureCollection<GeoJSON.Point> = { type: "FeatureCollection", features: azimuthFeaturesRef.current };
    if (!hasAzimuths) { removeAzimuthLayer(map, layerExists, sourceExists); return; }
    if (sourceExists) setAzimuthLayer(map, sourceData);
    else addAzimuthLayer(map, sourceData);
  };
  
  // Helper to remove the azimuth layer
  const removeAzimuthLayer = (map: mapboxgl.Map, layerExists: boolean, sourceExists: boolean) => {
    if (layerExists) map.removeLayer(AZIMUTH_LAYER_ID);
    if (sourceExists) map.removeSource(AZIMUTH_LAYER_ID);
  };

  // Helper to set new azimuth layer data
  const setAzimuthLayer = (map: mapboxgl.Map, sourceData: GeoJSON.FeatureCollection<GeoJSON.Point>) => {
    (map.getSource(AZIMUTH_LAYER_ID) as mapboxgl.GeoJSONSource).setData(sourceData)
  }
  
  // Helper to add the azimuth layer
  const addAzimuthLayer = (map: mapboxgl.Map, sourceData: GeoJSON.FeatureCollection<GeoJSON.Point>) => {
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
  

  return { calculateLineLength, calculateAzimuths, drawAzimuths, updateAzimuthLayer };
};

export default useMapCalcs;
