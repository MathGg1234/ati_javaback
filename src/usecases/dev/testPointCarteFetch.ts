import { fetchPointCartes } from "../../infra/backend/pointCarteRepo";

export async function testPointCarteFetch(token: string) {
    const data = await fetchPointCartes(token);
    console.log("[TEST] pointCarte count =", data.length);
    console.table(
        data.map((p) => ({
            id: p.id,
            nom: p.nom,
            type: p.type,
            symboleOTAN: p.symboleOTAN,
            lng: p.position?.lng,
            lat: p.position?.lat,
        }))
    );
    return data;
}
