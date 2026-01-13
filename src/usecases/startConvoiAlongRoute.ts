import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { ensureConvoiMarker } from "../infra/maplibre/convoiRenderer";

type Handle = { stop: () => void };

export function startConvoiAlongRoute(
    map: MapLibreMap,
    coords: [number, number][],
    markerRef: { current: Marker | null },
    speedMs = 80 // plus petit = plus rapide
): Handle {
    if (!coords.length) return { stop: () => {} };

    const marker = ensureConvoiMarker(map, markerRef);
    let i = 0;
    let timer: number | null = null;

    marker.setLngLat(coords[0]);

    timer = window.setInterval(() => {
        i = (i + 1) % coords.length;
        marker.setLngLat(coords[i]);
    }, speedMs);

    return {
        stop: () => {
            if (timer) window.clearInterval(timer);
            timer = null;
        },
    };
}
