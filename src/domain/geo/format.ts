/** Formatting helpers (copié depuis LeafletPrime: fmtKm/fmtMin) */
export function fmtKm(meters?: number | null): string {
  if (!meters || Number.isNaN(meters)) return "-";
  return `${(meters / 1000).toFixed(1)} km`;
}

export function fmtMin(seconds?: number | null): string {
  if (!seconds || Number.isNaN(seconds)) return "-";
  return `${Math.round(seconds / 60)} min`;
}
