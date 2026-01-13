import { httpGet, httpPut } from "./httpClient";

export type PositionDto = {
    id?: number;
    lng: number;
    lat: number;
    date?: string; // LocalDateTime côté Java (string ISO sans Z)
};

export type ConvoiDto = {
    id: number;
    nom: string;

    // ✅ ton backend a déjà été vu avec "symboleOTAN" (string)
    // On garde aussi codeOtan si tu l'as côté Java (optionnel)
    symboleOTAN?: string;
    codeOtan?: number;

    position: PositionDto;
};

const CONVOI_ID = Number(import.meta.env.VITE_CONVOI_ID ?? 2);

// ✅ GET /api/v1/convoi/{id}/
const PATH_GET = `/api/v1/convoi/${CONVOI_ID}/`;

// ✅ PUT /api/v1/convoi/{id}/ (update fiable)
const PATH_PUT = `/api/v1/convoi/${CONVOI_ID}/`;

function toLocalDateTimeString(d = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
}

export async function fetchConvoiDto(token: string): Promise<ConvoiDto> {
    return await httpGet<ConvoiDto>(PATH_GET, token);
}

/**
 * ✅ Update via PUT sur /api/v1/convoi/{id}/
 * -> bien plus probable que ça marche qu'un POST "upsert"
 */
export async function updateConvoiDto(token: string, dto: ConvoiDto): Promise<ConvoiDto> {
    return await httpPut<ConvoiDto>(PATH_PUT, dto, token);
}

export async function updateConvoiPosition(token: string, lng: number, lat: number): Promise<ConvoiDto> {
    const current = await fetchConvoiDto(token);

    const updated: ConvoiDto = {
        ...current,
        position: {
            ...(current.position ?? { lng, lat }),
            lng,
            lat,
            date: toLocalDateTimeString(),
        },
    };

    return await updateConvoiDto(token, updated);
}
