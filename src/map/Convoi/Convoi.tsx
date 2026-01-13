import React, { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";

// Fonction pour calculer la distance Haversine en mètres
function distanceMeters(
    [lng1, lat1]: [number, number],
    [lng2, lat2]: [number, number]
): number {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Obtenir un point intermédiaire sur un segment
function moveTowards(
    from: [number, number],
    to: [number, number],
    distance: number
): [number, number] {    const totalDist = distanceMeters(from, to);
    if (distance >= totalDist) return to;
    const ratio = distance / totalDist;
    return [
        from[0] + (to[0] - from[0]) * ratio,
        from[1] + (to[1] - from[1]) * ratio,
    ];
}

type ConvoiProps = {
    map: Map | null;
    route: [number, number][];
    speed?: number; // m/s
    name?: string;
    posRef: React.MutableRefObject<[number, number]>;
    onPositionUpdate?: () => void; // 🔔 Nouveau callback
};

const Convoi: React.FC<ConvoiProps> = ({
                                           map,
                                           route,
                                           speed = 10,
                                           name = "Convoi",
                                           posRef,
                                           onPositionUpdate,
                                       }) => {
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const segmentRef = useRef(0);
    const lastTimeRef = useRef<number>(0);
    const routeRef = useRef<[number, number][]>(route);

    // 🔁 Mise à jour dynamique de la route
    useEffect(() => {
        routeRef.current = route;
        segmentRef.current = 0; // 🎯 FORCE la reprise au début de la nouvelle route
    }, [route]);

    useEffect(() => {
        if (!map || !route.length) return;;

        // Création du marker
        if (!markerRef.current) {
            const el = document.createElement("div");
            el.style.width = "20px";
            el.style.height = "20px";
            el.style.backgroundColor = "#2563eb";
            el.style.border = "2px solid #1e40af";
            el.style.borderRadius = "3px";

            markerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat(posRef.current)
                .setPopup(new maplibregl.Popup().setText(name))
                .addTo(map);
        }

        let animationFrameId: number;

        const animate = (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const deltaTime = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            let remainingDistance = speed * deltaTime;
            let currentPos = posRef.current;
            const currentRoute = routeRef.current;

            if (!currentRoute.length) return;


            let seg = segmentRef.current;

            // On supprime la logique de recherche "nearestIdx" qui causait la glissade
            // car on sait que la route commence à notre position.

            while (remainingDistance > 0 && seg < currentRoute.length - 1) {
                const nextPoint = currentRoute[seg + 1];
                const distToNext = distanceMeters(currentPos, nextPoint);

                if (distToNext <= remainingDistance) {
                    currentPos = nextPoint;
                    remainingDistance -= distToNext;
                    seg += 1;
                } else {
                    currentPos = moveTowards(currentPos, nextPoint, remainingDistance);
                    remainingDistance = 0;
                }
            }

            posRef.current = currentPos;
            segmentRef.current = seg;

            markerRef.current?.setLngLat(currentPos);

            // On notifie le parent que le convoi a avancé
            if (onPositionUpdate) {
                onPositionUpdate();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            markerRef.current?.remove();
            markerRef.current = null;
        };
    }, [map, speed, name, posRef]);

    return null;
};

export default Convoi;