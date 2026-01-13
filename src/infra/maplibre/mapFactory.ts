import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";

export type CreateMapArgs = {
    container: HTMLElement;
    style: string | StyleSpecification;
    center: [number, number];
    zoom: number;
    maxBounds?: [[number, number], [number, number]];
};

export function createMap({ container, style, center, zoom, maxBounds }: CreateMapArgs): MapLibreMap {
    const map = new maplibregl.Map({
        container,
        style,
        center,
        zoom,
    });

    if (maxBounds) map.setMaxBounds(maxBounds);

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    return map;
}
