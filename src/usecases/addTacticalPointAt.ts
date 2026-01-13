import type { TacticalPoint } from "../domain/tactical/types";
import { createTacticalPoint, fetchPointCartes } from "../infra/backend/pointCarteRepo";

export async function addTacticalPointAt(
    lng: number,
    lat: number,
    defaults?: Partial<{ nom: string; type: string; symboleOTAN: string }>
): Promise<TacticalPoint[]> {
    await createTacticalPoint({
        nom: defaults?.nom ?? "Point",
        type: defaults?.type ?? "TACTICAL_POINT",
        symboleOTAN: defaults?.symboleOTAN ?? "SFGPUCI----K---", // par défaut (à adapter)
        longitude: lng,
        latitude: lat,
    });

    return await fetchPointCartes();
}
