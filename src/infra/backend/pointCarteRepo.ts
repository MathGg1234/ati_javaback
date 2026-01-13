import { http } from "./httpClient";
import type { PointCarteDto } from "../../domain/tactical/types";

// Base path backend (celui que tu logs déjà)
const BASE = "/api/v1/tacticalPoint/";

export async function fetchPointCartes(token: string): Promise<PointCarteDto[]> {
    return await http<PointCarteDto[]>(BASE, { token, method: "GET" });
}

export async function fetchPointCarteById(token: string, id: number): Promise<PointCarteDto> {
    return await http<PointCarteDto>(`${BASE}${id}/`, { token, method: "GET" });
}
