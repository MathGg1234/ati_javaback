import type { Map as MapLibreMap } from "maplibre-gl";

import type { PointCarteRepo } from "../infra/backend/pointCarteRepo";
import type { PointCarteRendererCtx } from "../infra/maplibre/pointCarteRenderer";
import { renderPointCarte } from "../infra/maplibre/pointCarteRenderer";

export async function loadInitialPointCartes(
  map: MapLibreMap,
  pointCarteRepo: PointCarteRepo,
  token: string,
  ctx: PointCarteRendererCtx
) {
  const points = await pointCarteRepo.fetchPointCartes(token);

  // reset markers
  ctx.markersById.forEach((m) => m.remove());
  ctx.markersById.clear();

  points.forEach((p) => renderPointCarte(ctx, map, p));
}
