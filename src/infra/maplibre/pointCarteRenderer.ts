import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { PointCarteDto } from "../../domain/tactical/types";

export type PointCarteRenderStore = {
    markersById: Map<number, maplibregl.Marker>;
};

export function createPointCarteStore(): PointCarteRenderStore {
    return { markersById: new Map() };
}

export function clearAllPointCartes(store: PointCarteRenderStore): void {
    for (const m of store.markersById.values()) m.remove();
    store.markersById.clear();
}

export function renderPointCarte(map: MapLibreMap, store: PointCarteRenderStore, p: PointCarteDto): void {
    if (!p.position) return;

    if (store.markersById.has(p.id)) return;

    const marker = new maplibregl.Marker({ color: "#ef4444" })
        .setLngLat([p.position.lng, p.position.lat])
        .setPopup(new maplibregl.Popup().setText(`${p.nom} • ${p.type}`))
        .addTo(map);

    store.markersById.set(p.id, marker);
}

export function removePointCarte(store: PointCarteRenderStore, id: number): void {
    const m = store.markersById.get(id);
    if (m) {
        m.remove();
        store.markersById.delete(id);
    }
}
