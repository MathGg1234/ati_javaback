import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";

import { BASEMAPS, type BasemapId } from "../../domain/config/basemaps";
import { AMBERIEU_EN_BUGEY, LYON } from "../../domain/config/constants";

import { PointCarteRepoImpl } from "../../infra/backend/pointCarteRepo";
import { loadInitialPointCartes } from "../../usecases/loadInitialPointCartes";
import { createLayerManager } from "../../infra/maplibre/layerManager";
import { renderRoute } from "../../infra/maplibre/routeRenderer";
import { fetchGraphHopperRoute } from "../../infra/routing/graphhopperClient";
import type { PointCarteRendererCtx } from "../../infra/maplibre/pointCarteRenderer";
import { makePointCarteRendererCtx } from "../../infra/maplibre/pointCarteRenderer";

export type UseCoreControllerArgs = {
  token: string;
  /** Ouvre la modale "point OTAN" (clic droit) */
  openPointModal: (p: [number, number]) => void;
};

export function useCoreController({ token, openPointModal }: UseCoreControllerArgs) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const [basemapId, setBasemapId] = useState<BasemapId>("osm");
  const [routeLine, setRouteLine] = useState<[number, number][]>([]);

  // Position convoi (ref, comme dans LeafletPrime)
  const convoiPosRef = useRef<[number, number]>(LYON);

  const pointCarteRepo = useMemo(() => new PointCarteRepoImpl(), []);
  const layerManagerRef = useRef<ReturnType<typeof createLayerManager> | null>(null);

  // ✅ Renderer ctx pour gérer les markers (remove/replace)
  const pointCtxRef = useRef<PointCarteRendererCtx>(makePointCarteRendererCtx());

  // openRef : évite stale closure
  const openRef = useRef(openPointModal);
  useEffect(() => {
    openRef.current = openPointModal;
  }, [openPointModal]);

  const ensureRoute = async (map: MapLibreMap) => {
    // Route Lyon -> Ambérieu (GraphHopper)
    const gh = await fetchGraphHopperRoute(LYON, AMBERIEU_EN_BUGEY);

      renderRoute(map, gh.geojson);

    const feature = gh.geojson.features?.[0];
    if (feature?.geometry?.type === "LineString" && Array.isArray(feature.geometry.coordinates)) {
      const line = feature.geometry.coordinates as [number, number][];
      setRouteLine(line);
      // On positionne le convoi au départ si jamais
      if (line.length) convoiPosRef.current = line[0];
    }
  };

  const switchBasemap = (next: BasemapId) => {
    const map = mapRef.current;
    setBasemapId(next);
    if (!map) return;
    map.setStyle(BASEMAPS[next].style);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAPS[basemapId].style,
      center: LYON,
      zoom: 9,
    });

    mapRef.current = map;
    layerManagerRef.current = createLayerManager(map);

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const preventCtxMenu = (e: MouseEvent) => e.preventDefault();

    const _toggleModal = (e: maplibregl.MapMouseEvent) => {
      const p: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      openRef.current(p);
    };

    const onContextMenu = (e: maplibregl.MapMouseEvent) => _toggleModal(e);

    const onLoad = async () => {
      // Marqueurs fixes
      new maplibregl.Marker({ color: "#2563eb" })
        .setLngLat(LYON)
        .setPopup(new maplibregl.Popup().setText("Lyon"))
        .addTo(map);

      new maplibregl.Marker({ color: "#16a34a" })
        .setLngLat(AMBERIEU_EN_BUGEY)
        .setPopup(new maplibregl.Popup().setText("Ambérieu-en-Bugey"))
        .addTo(map);

      // Route + convoi
      await ensureRoute(map);

      // Points BD
      try {
        await loadInitialPointCartes(map, pointCarteRepo, token, pointCtxRef.current);
      } catch (e) {
        console.error("loadInitialPointCartes:", e);
      }

      map.getCanvas().addEventListener("contextmenu", preventCtxMenu);
      map.on("contextmenu", onContextMenu);
    };

    const onStyleLoad = async () => {
      // Important : recréer les couches custom après setStyle
      layerManagerRef.current = createLayerManager(map);

      try {
        await ensureRoute(map);
      } catch (e) {
        console.error("ensureRoute (style.load):", e);
      }

      try {
        await loadInitialPointCartes(map, pointCarteRepo, token, pointCtxRef.current);
      } catch (e) {
        console.error("loadInitialPointCartes (style.load):", e);
      }
    };

    map.on("load", onLoad);
    map.on("style.load", onStyleLoad);

    return () => {
      try {
        map.getCanvas().removeEventListener("contextmenu", preventCtxMenu);
      } catch {}
      try {
        map.off("contextmenu", onContextMenu);
      } catch {}
      try {
        map.off("load", onLoad);
      } catch {}
      try {
        map.off("style.load", onStyleLoad);
      } catch {}
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    mapContainerRef,
    mapRef,
    basemapId,
    switchBasemap,
    routeLine,
    convoiPosRef,
    pointCtxRef,
    pointCarteRepo,
  };
}
