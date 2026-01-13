import type { Map as MapLibreMap } from "maplibre-gl";

const SOURCE_ID = "route";
const CASING_LAYER_ID = "route-casing";
const LINE_LAYER_ID = "route-line";

export function renderRoute(map: MapLibreMap, geojson: GeoJSON.FeatureCollection<GeoJSON.LineString>) {
    const src = map.getSource(SOURCE_ID) as any;
    if (src && typeof src.setData === "function") {
        src.setData(geojson);
    } else {
        map.addSource(SOURCE_ID, { type: "geojson", data: geojson });
    }

    if (!map.getLayer(CASING_LAYER_ID)) {
        map.addLayer({
            id: CASING_LAYER_ID,
            type: "line",
            source: SOURCE_ID,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#0b0f19", "line-width": 7, "line-opacity": 0.8 },
        });
    }

    if (!map.getLayer(LINE_LAYER_ID)) {
        map.addLayer({
            id: LINE_LAYER_ID,
            type: "line",
            source: SOURCE_ID,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ff4b4b", "line-width": 5, "line-opacity": 0.9 },
        });
    }
}

export function clearRoute(map: MapLibreMap) {
    if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
    if (map.getLayer(CASING_LAYER_ID)) map.removeLayer(CASING_LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}
