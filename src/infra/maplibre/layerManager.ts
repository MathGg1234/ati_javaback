import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Gère l'ordre et la persistance des couches techniques sur la carte.
 * Utile pour s'assurer que les tracés (routes, zones) restent au-dessus
 * même après un changement de style (basemap).
 */
export function createLayerManager(map: MapLibreMap) {
    return {
        /**
         * S'assure qu'une source GeoJSON existe.
         * Si elle existe déjà, on met à jour ses données.
         */
        ensureGeoJSONSource(id: string, data: GeoJSON.FeatureCollection | GeoJSON.Feature) {
            const source = map.getSource(id);
            if (source && source.type === "geojson") {
                source.setData(data);
            } else {
                map.addSource(id, {
                    type: "geojson",
                    data: data,
                });
            }
        },

        /**
         * Ajoute une couche si elle n'existe pas déjà.
         */
        addLayerIfMissing(config: any) {
            if (!map.getLayer(config.id)) {
                map.addLayer(config);
            }
        }
    };
}