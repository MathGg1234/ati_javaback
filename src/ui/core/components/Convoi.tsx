import React, { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";

type LngLat = [number, number];

function distanceMeters([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function moveTowards(from: LngLat, to: LngLat, distance: number): LngLat {
    const totalDist = distanceMeters(from, to);
    if (totalDist <= 0) return to;
    if (distance >= totalDist) return to;
    const ratio = distance / totalDist;
    return [from[0] + (to[0] - from[0]) * ratio, from[1] + (to[1] - from[1]) * ratio];
}

type ConvoiProps = {
    map: Map | null;
    route: LngLat[];
    speed?: number; // m/s (0 => suiveur)
    name?: string;

    // 🔥 source de vérité côté app (ref pour pilote + stockage partagé)
    posRef: React.MutableRefObject<LngLat>;

    // ✅ NEW: position réactive (suiveur) : venant du backend via state
    // (si non fourni, le composant fonctionne comme avant)
    pos?: LngLat | null;

    onPositionUpdate?: () => void;
};

const Convoi: React.FC<ConvoiProps> = ({
                                           map,
                                           route,
                                           speed = 10,
                                           name = "Convoi",
                                           posRef,
                                           pos,
                                           onPositionUpdate,
                                       }) => {
    const markerRef = useRef<maplibregl.Marker | null>(null);

    const routeRef = useRef<LngLat[]>(route);
    const segmentRef = useRef(0);

    const rafRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        routeRef.current = route;
        segmentRef.current = 0;
        lastTimeRef.current = 0;
    }, [route]);

    // ✅ marker lifecycle
    useEffect(() => {
        if (!map) return;

        if (!markerRef.current) {
            const el = document.createElement("div");
            el.style.width = "18px";
            el.style.height = "18px";
            el.style.backgroundColor = "#2563eb";
            el.style.border = "2px solid #1e40af";
            el.style.borderRadius = "3px";
            el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.35)";

            markerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat(posRef.current)
                .setPopup(new maplibregl.Popup({ closeButton: false }).setText(name))
                .addTo(map);
        } else {
            markerRef.current.setLngLat(posRef.current);
        }

        return () => {
            markerRef.current?.remove();
            markerRef.current = null;
        };
    }, [map, name, posRef]);

    // ✅ NEW: en mode suiveur, appliquer directement les positions reçues (pos)
    useEffect(() => {
        if (!map) return;
        if (!pos) return;

        // on synchronise le ref (source de vérité globale)
        posRef.current = pos;

        // et on force le marker (sans dépendre du RAF/throttling)
        markerRef.current?.setLngLat(pos);
    }, [map, pos, posRef]);

    // ✅ animation loop (pilote uniquement)
    useEffect(() => {
        if (!map) return;

        const animate = (time: number) => {
            rafRef.current = requestAnimationFrame(animate);

            // Toujours afficher le marker à la position actuelle (utile en pilote)
            markerRef.current?.setLngLat(posRef.current);

            // mode suiveur : on n’avance pas ici (c’est "pos" qui drive)
            if (speed <= 0) return;

            if (!lastTimeRef.current) {
                lastTimeRef.current = time;
                return;
            }

            const dt = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            const currentRoute = routeRef.current;
            if (!currentRoute || currentRoute.length < 2) return;

            let remaining = speed * dt;
            let currentPos = posRef.current;
            let seg = segmentRef.current;

            if (seg < 0) seg = 0;
            if (seg > currentRoute.length - 2) seg = currentRoute.length - 2;

            while (remaining > 0 && seg < currentRoute.length - 1) {
                const nextPoint = currentRoute[seg + 1];
                const distToNext = distanceMeters(currentPos, nextPoint);

                if (distToNext <= remaining) {
                    currentPos = nextPoint;
                    remaining -= distToNext;
                    seg += 1;
                    if (seg >= currentRoute.length - 1) break;
                } else {
                    currentPos = moveTowards(currentPos, nextPoint, remaining);
                    remaining = 0;
                }
            }

            posRef.current = currentPos;
            segmentRef.current = seg;

            markerRef.current?.setLngLat(currentPos);
            onPositionUpdate?.();
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTimeRef.current = 0;
        };
    }, [map, speed, posRef, onPositionUpdate]);

    return null;
};

export default Convoi;
