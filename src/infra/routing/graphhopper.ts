import type { LngLat, RouteRequest, RouteResult } from "../../domain/routing/types";

const RAW_BASE = (import.meta.env.VITE_GRAPHHOPPER_URL as string | undefined) ?? "/gh";

function normalizeBaseUrl(base: string): string {
    // - si vide => /gh
    // - supprime le trailing slash
    // - garde /gh (proxy) ou une URL complète http(s)://...
    const b = (base || "/gh").trim();
    return b.endsWith("/") ? b.slice(0, -1) : b;
}

const GRAPHHOPPER_URL = normalizeBaseUrl(RAW_BASE);

function asLngLat(p: unknown): LngLat {
    if (Array.isArray(p) && p.length === 2) return [Number(p[0]), Number(p[1])];
    if (p && typeof p === "object" && "lng" in p && "lat" in p) {
        const o = p as { lng: unknown; lat: unknown };
        return [Number(o.lng), Number(o.lat)];
    }
    if (p && typeof p === "object" && "lon" in p && "lat" in p) {
        const o = p as { lon: unknown; lat: unknown };
        return [Number(o.lon), Number(o.lat)];
    }
    throw new TypeError(`Invalid point (expected [lng,lat] or {lng,lat}): ${JSON.stringify(p)}`);
}

/**
 * Approximation simple d'un cercle en polygone (en degrés) autour d'un point [lng,lat].
 * Suffisant pour un "avoid" GraphHopper via custom_model.
 */
function circlePolygon(center: LngLat, radiusM: number, steps = 28): LngLat[] {
    const [lng, lat] = center;
    const latRad = (lat * Math.PI) / 180;

    const dLat = radiusM / 111_320; // m -> degrés latitude approx
    const dLng = radiusM / (111_320 * Math.cos(latRad));

    const pts: LngLat[] = [];
    for (let i = 0; i < steps; i += 1) {
        const a = (2 * Math.PI * i) / steps;
        const x = lng + dLng * Math.cos(a);
        const y = lat + dLat * Math.sin(a);
        pts.push([x, y]);
    }
    pts.push(pts[0]); // ferme
    return pts;
}

export async function computeSingleRoute(req: RouteRequest): Promise<RouteResult | null> {
    const start = asLngLat(req.start);
    const end = asLngLat(req.end);
    const vias = (req.vias ?? []).map(asLngLat);
    const avoids = (req.avoids ?? []).map(asLngLat);
    const avoidRadiusM = req.avoidRadiusM ?? 5_000;

    const points: LngLat[] = [start, ...vias, end];

    // (Leaflet_prime) : chaque avoid devient une zone (polygone) + règle de priorité.
    const avoidRules = avoids.map((center, idx) => ({
        id: `avoid_${idx}`,
        center,
        radiusM: avoidRadiusM,
        multiplyBy: "0.001", // très pénalisant
    }));

    const areas: Record<string, GeoJSON.Feature<GeoJSON.Polygon>> = {};
    for (const r of avoidRules) {
        areas[r.id] = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [circlePolygon(r.center, r.radiusM).map(([x, y]) => [x, y])],
            },
        };
    }

    const body = {
        profile: "car",
        points_encoded: false,
        points: points.map(([x, y]) => [x, y]),
        instructions: false,
        "ch.disable": true,
        custom_model: {
            areas,
            priority: [
                { if: "road_class == MOTORWAY", multiply_by: "0.000001" },
                ...avoidRules.map((r) => ({ if: `in_${r.id}`, multiply_by: r.multiplyBy })),
            ],
        },
    };

    const url = `${GRAPHHOPPER_URL}/route`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Erreur GraphHopper:", res.status, text);
        console.error(
            `URL appelée: ${url}\n` +
            `Si tu es en DEV: vérifie vite.config.ts (proxy /gh) et VITE_GRAPHHOPPER_TARGET dans .env`
        );
        return null;
    }

    const json = (await res.json()) as any;
    const path = json?.paths?.[0];
    const pts = path?.points;
    const coords = pts?.coordinates;

    if (!path || !Array.isArray(coords) || coords.length === 0) {
        console.error("Réponse GraphHopper inattendue:", json);
        return null;
    }

    const coordinates = coords.map((c: any) => [Number(c[0]), Number(c[1])] as LngLat);
    const distance = Number(path.distance);
    const duration = Number(path.time) / 1000;

    const geojson: RouteResult["geojson"] = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: coordinates.map(([x, y]) => [x, y]),
                },
                properties: { distance, duration },
            },
        ],
    };

    return { geojson, distance, duration, coordinates };
}
