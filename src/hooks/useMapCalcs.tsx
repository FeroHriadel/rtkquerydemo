import { MapRef } from "react-map-gl";
import * as turf from "@turf/turf"; //geospatial calculations



interface UseMapCalcsProps {
  mapRef: React.MutableRefObject<MapRef | null>;
  azimuthFeaturesRef: React.MutableRefObject<GeoJSON.Feature<GeoJSON.Point>[]>; //azimuths from all calculations
}


const useMapCalcs = ({ mapRef, azimuthFeaturesRef }: UseMapCalcsProps) => {

  function getMap() {
    return mapRef.current?.getMap();
  }
  

  function calculateLineLength(geometry: GeoJSON.LineString) {
    const feature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      geometry: geometry,
      properties: {}
    };
    const lengthInKm = turf.length(feature, { units: 'kilometers' });
    console.log("Line Length in km:", lengthInKm);
  }


  function calculateAzimuths(geometry: GeoJSON.LineString) {
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
    if (azimuthFeaturesRef.current.length === 0) {
      if (map.getLayer(azimuthLayerId)) {
        map.removeLayer(azimuthLayerId);
      }
      if (map.getSource(azimuthLayerId)) {
        map.removeSource(azimuthLayerId);
      }
      return;
    }
  
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
  


  return {
    calculateLineLength,
    calculateAzimuths,
    drawAzimuths,
    updateAzimuthLayer
  }
}

export default useMapCalcs