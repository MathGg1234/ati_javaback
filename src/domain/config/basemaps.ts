import type { StyleSpecification } from "maplibre-gl";

export type BasemapId = "osm" | "sat" | "topo";

export const BASEMAPS: Record<
    BasemapId,
    { label: string; style: StyleSpecification }
> = {
    osm: {
        label: "OSM (standard)",
        style: {
            version: 8,
            sources: {
                "osm-tiles": {
                    type: "raster",
                    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "© OpenStreetMap contributors",
                },
            },
            layers: [
                {
                    id: "osm-tiles-layer",
                    type: "raster",
                    source: "osm-tiles",
                },
            ],
        },
    },

    sat: {
        label: "Satellite (Esri)",
        style: {
            version: 8,
            sources: {
                "esri-sat": {
                    type: "raster",
                    tiles: [
                        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    ],
                    tileSize: 256,
                    attribution: "Tiles © Esri",
                },
            },
            layers: [
                {
                    id: "esri-sat-layer",
                    type: "raster",
                    source: "esri-sat",
                },
            ],
        },
    },

    topo: {
        label: "Topo (OpenTopoMap)",
        style: {
            version: 8,
            sources: {
                opentopo: {
                    type: "raster",
                    tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution:
                        "© OpenTopoMap (CC-BY-SA) © OpenStreetMap contributors",
                },
            },
            layers: [
                {
                    id: "opentopo-layer",
                    type: "raster",
                    source: "opentopo",
                },
            ],
        },
    },
};
