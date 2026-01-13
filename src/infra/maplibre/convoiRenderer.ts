import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";

export function ensureConvoiMarker(map: MapLibreMap, markerRef: { current: Marker | null }) {
    if (markerRef.current) return markerRef.current;

    const el = document.createElement("div");
    el.style.width = "14px";
    el.style.height = "14px";
    el.style.borderRadius = "50%";
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 0 10px rgba(0,0,0,0.35)";
    el.style.background = "#1e90ff";

    markerRef.current = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([0, 0]).addTo(map);
    return markerRef.current;
}
