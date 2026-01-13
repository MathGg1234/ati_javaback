import type { Map as MapLibreMap } from "maplibre-gl";

const SOURCE_ID = "core:route";
const LAYER_ID = "core:route-line";

export function renderRoute(map: MapLibreMap, coords: [number, number][]) {
    const geojson = {
        type: "FeatureCollection" as const,
        features: [
            {
                type: "Feature" as const,
                properties: {},
                geometry: {
                    type: "LineString" as const,
                    coordinates: coords,
                },
            },
        ],
    };

    const hasSource = !!map.getSource(SOURCE_ID);

    if (!hasSource) {
        map.addSource(SOURCE_ID, { type: "geojson", data: geojson });

        map.addLayer({
            id: LAYER_ID,
            type: "line",
            source: SOURCE_ID,
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-width": 5,
                "line-opacity": 0.9,
            },
        });
    } else {
        // @ts-expect-error MapLibre typings
        map.getSource(SOURCE_ID).setData(geojson);
    }
}
