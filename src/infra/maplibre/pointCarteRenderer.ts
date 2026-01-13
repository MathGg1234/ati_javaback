import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";

import type { PointCarteDto } from "../backend/pointCarteRepo";
import { makeSymbolSvg } from "../../map/AddAvoidPoint/milSymbolImport";

/**
 * Renderer "à la LeafletPrime" : on affiche un marqueur SVG OTAN (milsymbol) si possible.
 * - Fallback : un point rouge si le SIDC est invalide.
 */

export type PointCarteRendererCtx = {
    markersById: Map<string, maplibregl.Marker>;
};

export function makePointCarteRendererCtx(): PointCarteRendererCtx {
    return {
        markersById: new Map(),
    };
}

const fallbackMarkerEl = () => {
  const el = document.createElement("div");
  el.style.width = "14px";
  el.style.height = "14px";
  el.style.borderRadius = "999px";
  el.style.background = "#ef4444";
  el.style.border = "2px solid white";
  el.style.boxShadow = "0 1px 6px rgba(0,0,0,.35)";
  return el;
};

const svgMarkerEl = (sidc: string) => {
  const svg = makeSymbolSvg(sidc);
  if (!svg) return null;

  const el = document.createElement("div");
  el.style.width = "36px";
  el.style.height = "36px";
  el.style.display = "grid";
  el.style.placeItems = "center";
  el.style.transform = "translate(0, -18px)"; // pointe au sol
  el.innerHTML = svg;

  const inner = el.firstElementChild as HTMLElement | null;
  if (inner) {
    inner.style.width = "36px";
    inner.style.height = "36px";
  }

  return el;
};

export function renderPointCarte(ctx: PointCarteRendererCtx, map: MapLibreMap, point: PointCarteDto) {
  const id = point.id;
  if (!id) return;

  // remove previous if exists
  const prev = ctx.markersById.get(id);
  if (prev) {
    prev.remove();
    ctx.markersById.delete(id);
  }

  const sidc = (point.symboleOTAN ?? "").trim();
  const el = svgMarkerEl(sidc) ?? fallbackMarkerEl();

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat([point.position.lng, point.position.lat])
    .setPopup(
      new maplibregl.Popup({ offset: 18 }).setHTML(
        `<div style="font-size:12px">
          <div style="font-weight:600">${(point.nom ?? "Point").replace(/</g, "&lt;")}</div>
          <div style="opacity:.8">${(point.type ?? "").replace(/</g, "&lt;")}</div>
          <div style="opacity:.7">${sidc ? sidc.replace(/</g, "&lt;") : "(SIDC vide)"}</div>
        </div>`
      )
    )
    .addTo(map);

  ctx.markersById.set(id, marker);
}

export function removePointCarte(ctx: PointCarteRendererCtx, id: string) {
  const m = ctx.markersById.get(id);
  if (m) {
    m.remove();
    ctx.markersById.delete(id);
  }
}
