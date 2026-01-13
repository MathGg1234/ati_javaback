import { useRef, useState } from "react";
import { MapCanvas } from "./components/MapCanvas";
import { useCoreController } from "./useCoreController";
import { BASEMAPS, type BasemapId } from "../../domain/config/basemaps";
import Convoi from "./components/Convoi";
import { useConvoiSync } from "./hooks/useConvoiSync";
import type { LngLat } from "../../domain/routing/types";

export function CoreApp({ token, userLabel, onLogout }: any) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const { map, basemapId, setBasemapId, pointCount, route, routeCoords, convoiPosRef } =
        useCoreController(mapContainerRef, token);

    const [isDriver, setIsDriver] = useState(false);

    // ✅ position réactive (pour suiveurs)
    const [remotePos, setRemotePos] = useState<LngLat | null>(null);

    // ✅ UN SEUL hook (avec callback)
    useConvoiSync({
        token,
        isDriver,
        convoiPosRef,
        onRemotePos: (p) => setRemotePos(p),
    });

    const fmtKm = (m: number) => `${(m / 1000).toFixed(1)} km`;
    const fmtMin = (s: number) => `${Math.round(s / 60)} min`;

    return (
        <div style={{ height: "100dvh", width: "100%", overflow: "hidden", position: "relative" }}>
            <MapCanvas containerRef={mapContainerRef} />

            <Convoi
                map={map}
                route={routeCoords}
                speed={isDriver ? 10 : 0}
                name={isDriver ? "Convoi (Pilote)" : "Convoi"}
                posRef={convoiPosRef}
                pos={remotePos} // ✅ suiveur: drive le marker via pos
            />

            <div
                style={{
                    position: "absolute",
                    zIndex: 10,
                    top: 12,
                    left: 12,
                    width: 360,
                    background: "#111827",
                    color: "white",
                    padding: 12,
                    borderRadius: 12,
                    display: "grid",
                    gap: 10,
                }}
            >
                {(userLabel || onLogout) && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ lineHeight: 1.2 }}>
                            {userLabel && (
                                <div>
                                    Connecté : <b>{userLabel}</b>
                                </div>
                            )}
                        </div>
                        {onLogout && (
                            <button onClick={onLogout} style={{ padding: "6px 10px" }}>
                                Déconnexion
                            </button>
                        )}
                    </div>
                )}

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <input type="checkbox" checked={isDriver} onChange={(e) => setIsDriver(e.target.checked)} />
                    Piloter le convoi (ce navigateur envoie la position)
                </label>

                <div style={{ fontSize: 12, opacity: 0.9 }}>
                    Astuce : ouvre un 2ème onglet en <b>non-pilote</b>, il suivra la position stockée en backend.
                </div>

                <div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Fond de carte</div>
                    <select
                        value={basemapId}
                        onChange={(e) => setBasemapId(e.target.value as BasemapId)}
                        style={{ width: "100%", padding: 8 }}
                    >
                        {Object.entries(BASEMAPS).map(([id, v]) => (
                            <option key={id} value={id}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ fontSize: 13 }}>
                    Points carte (backend Java) : <b>{pointCount}</b>
                </div>

                {route && (
                    <div style={{ fontSize: 13 }}>
                        Itinéraire : <b>{fmtKm(route.distanceM)}</b> • <b>{fmtMin(route.durationS)}</b>
                    </div>
                )}

                {!token && (
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                        Token manquant : impossible de sync (convoi + points).
                    </div>
                )}
            </div>
        </div>
    );
}
