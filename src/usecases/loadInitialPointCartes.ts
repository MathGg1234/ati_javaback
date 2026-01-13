import type { Map as MapLibreMap } from "maplibre-gl";
import { fetchPointCartes } from "../infra/backend/pointCarteRepo";
import {
    clearAllPointCartes,
    renderPointCarte,
    type PointCarteRenderStore,
} from "../infra/maplibre/pointCarteRenderer";

export async function loadInitialPointCartes(
    map: MapLibreMap,
    store: PointCarteRenderStore,
    token: string
): Promise<number> {
    const points = await fetchPointCartes(token);

    clearAllPointCartes(store);

    for (const p of points) renderPointCarte(map, store, p);

    return store.markersById.size;
}
