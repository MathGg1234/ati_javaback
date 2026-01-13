import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { createMap } from "../../infra/maplibre/mapFactory";
import { BASEMAPS, type BasemapId } from "../../domain/config/basemaps";
import { AMBERIEU_EN_BUGEY, LYON } from "../../domain/config/constants";

import { createPointCarteStore, type PointCarteRenderStore } from "../../infra/maplibre/pointCarteRenderer";
import { loadInitialPointCartes } from "../../usecases/loadInitialPointCartes";

import { computeSingleRoute } from "../../infra/routing/graphhopper";
import { renderRoute } from "../../infra/maplibre/routeRenderer";
import type { LngLat } from "../../domain/routing/types";

type RouteMetrics = { distanceM: number; durationS: number };

export type CoreController = {
    mapRef: React.MutableRefObject<MapLibreMap | null>;
    map: MapLibreMap | null; // ✅ IMPORTANT: state pour déclencher re-render
    basemapId: BasemapId;
    setBasemapId: (id: BasemapId) => void;

    pointCount: number;

    route?: RouteMetrics;
    routeCoords: LngLat[];

    convoiPosRef: React.MutableRefObject<LngLat>;
};

export function useCoreController(
    containerRef: React.RefObject<HTMLDivElement | null>,
    token?: string
): CoreController {
    const mapRef = useRef<MapLibreMap | null>(null);

    // ✅ ajout d'un state : quand la map est créée, le composant re-render
    const [map, setMap] = useState<MapLibreMap | null>(null);

    const [basemapId, setBasemapId] = useState<BasemapId>("osm");
    const [pointCount, setPointCount] = useState(0);

    const [route, setRoute] = useState<RouteMetrics | undefined>(undefined);
    const [routeCoords, setRouteCoords] = useState<LngLat[]>([]);

    // Position convoi
    const convoiPosRef = useRef<LngLat>(LYON);

    const storeRef = useRef<PointCarteRenderStore>(createPointCarteStore());

    // init map une fois
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        if (mapRef.current) return;

        const lat = LYON[1];
        const lng = LYON[0];

        const createdMap = createMap({
            container,
            style: BASEMAPS[basemapId].style,
            center: LYON,
            zoom: 9,
            maxBounds: [
                [lng - 0.64, lat - 0.45],
                [lng + 0.64, lat + 0.45],
            ],
        });

        mapRef.current = createdMap;
        setMap(createdMap); // ✅ déclenche un re-render => Convoi reçoit enfin la map

        const onLoad = async () => {
            if (!token) return;

            try {
                const count = await loadInitialPointCartes(createdMap, storeRef.current, token);
                setPointCount(count);
            } catch (e) {
                console.error("loadInitialPointCartes:", e);
            }

            // Itinéraire
            try {
                const r = await computeSingleRoute({ start: LYON, end: AMBERIEU_EN_BUGEY, avoids: [], vias: [] });
                if (r) {
                    renderRoute(createdMap, r.geojson);
                    setRoute({ distanceM: r.distance, durationS: r.duration });
                    setRouteCoords(r.coordinates);

                    // Optionnel : positionner le convoi au début de la route
                    if (r.coordinates.length > 0) convoiPosRef.current = r.coordinates[0];
                }
            } catch (e) {
                console.error("computeSingleRoute:", e);
            }
        };

        createdMap.on("load", onLoad);

        return () => {
            try {
                createdMap.off("load", onLoad);
            } catch {}
            try {
                createdMap.remove();
            } catch {}
            mapRef.current = null;
            setMap(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef]);

    // switch basemap
    useEffect(() => {
        const m = mapRef.current;
        if (!m) return;

        const onStyleLoad = async () => {
            if (!token) return;

            try {
                const count = await loadInitialPointCartes(m, storeRef.current, token);
                setPointCount(count);
            } catch (e) {
                console.error("loadInitialPointCartes (after setStyle):", e);
            }

            try {
                const r = await computeSingleRoute({ start: LYON, end: AMBERIEU_EN_BUGEY, avoids: [], vias: [] });
                if (r) {
                    renderRoute(m, r.geojson);
                    setRoute({ distanceM: r.distance, durationS: r.duration });
                    setRouteCoords(r.coordinates);
                }
            } catch (e) {
                console.error("computeSingleRoute (after setStyle):", e);
            }
        };

        m.once("style.load", onStyleLoad);
        m.setStyle(BASEMAPS[basemapId].style);

        return () => {
            try {
                m.off("style.load", onStyleLoad);
            } catch {}
        };
    }, [basemapId, token]);

    // re-load points si token arrive après coup
    useEffect(() => {
        const m = mapRef.current;
        if (!m) return;
        if (!token) return;

        if (m.loaded()) {
            loadInitialPointCartes(m, storeRef.current, token)
                .then((count) => setPointCount(count))
                .catch((e) => console.error("loadInitialPointCartes (token effect):", e));
        }
    }, [token]);

    return {
        mapRef,
        map,
        basemapId,
        setBasemapId,
        pointCount,
        route,
        routeCoords,
        convoiPosRef,
    };
}
