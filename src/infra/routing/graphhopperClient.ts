export type GraphHopperRoute = {
    coords: [number, number][]; // [lng, lat]
    distanceMeters: number;
    timeMs: number;
};

const GH_BASE = import.meta.env.VITE_URL_GRAPHHOPPER ?? "/gh";
// ex: VITE_URL_GRAPHHOPPER="http://172.16.138.140:8989" ou laisser "/gh" si proxy nginx

export async function fetchGraphHopperRoute(start: [number, number], end: [number, number]): Promise<GraphHopperRoute> {
    const [slng, slat] = start;
    const [elng, elat] = end;

    // GraphHopper: point=lat,lng
    const url =
        `${GH_BASE}/route?` +
        `point=${slat},${slng}&point=${elat},${elng}` +
        `&profile=car&points_encoded=false&instructions=false&calc_points=true`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`GraphHopper HTTP ${res.status}`);

    const data = await res.json();

    const path = data?.paths?.[0];
    const coords: [number, number][] =
        path?.points?.coordinates?.map((c: [number, number]) => [c[0], c[1]]) ?? [];

    return {
        coords,
        distanceMeters: path?.distance ?? 0,
        timeMs: path?.time ?? 0,
    };
}
