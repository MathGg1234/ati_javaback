export type LngLat = [number, number];

export type RouteResult = {
    /** GeoJSON prêt à être rendu dans MapLibre */
    geojson: GeoJSON.FeatureCollection<GeoJSON.LineString>;
    /** en mètres */
    distance: number;
    /** en secondes */
    duration: number;
    /** la polyline sous forme de [lng,lat] */
    coordinates: LngLat[];
};

export type RouteRequest = {
    start: LngLat;
    end: LngLat;
    vias?: LngLat[];
    avoids?: LngLat[];
    avoidRadiusM?: number;
};
