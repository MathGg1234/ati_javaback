import React, { useEffect, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";
import "../../map/AddAvoidPoint/AddAvoidPoint.css";
import "./CoreApp.css";

import Convoi from "../../map/Convoi/Convoi";

import { BASEMAPS, type BasemapId } from "../../domain/config/basemaps";
import { fmtKm, fmtMin } from "../../domain/geo/format";
import type { LngLat } from "../../domain/geo/types";

import { useAddAvoidPoint, type ModalPointPayload } from "../../map/AddAvoidPoint/AddAvoidPoint";
import { useCoreController } from "./useCoreController";

type CoreAppProps = {
  token: string;
  userLabel?: string;
  onLogout?: () => void;
};

export const CoreApp: React.FC<CoreAppProps> = ({ token, userLabel, onLogout }) => {
  // Modal (copiée du fonctionnement LeafletPrime)
  const onSubmitRef = useRef<(payload: ModalPointPayload) => void>(() => {});

  const { open, Modal: PointModal } = useAddAvoidPoint({
    onSubmit: (payload) => onSubmitRef.current(payload),
  });

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const {
    mapContainerRef,
    mapRef,
    basemapId,
    setBasemapId,
    switchBasemap,
    routeLine,
    convoiPosRef,
    metrics,
    bindModalSubmit,
  } = useCoreController({
    token,
    openPointModal: (p: LngLat) => openRef.current(p),
  });

  // branche le submit "réel" (création point + rendu)
  useEffect(() => {
    onSubmitRef.current = bindModalSubmit;
  }, [bindModalSubmit]);

  return (
    <div className="core-root">
      {PointModal}

      <div ref={mapContainerRef} className="map-container" />

      {mapRef.current && routeLine.length > 0 && (
        <Convoi
          map={mapRef.current}
          route={routeLine}
          speed={20}
          name="Convoi principal"
          posRef={convoiPosRef}
          onPositionUpdate={() => {
            /* plus tard: sync DB / reroute */
          }}
        />
      )}

      <div className="hud">
        {(userLabel || onLogout) && (
          <div className="hud-session">
            {userLabel && (
              <div className="hud-session-line">
                Connecté : <b>{userLabel}</b>
              </div>
            )}
            {onLogout && (
              <button className="hud-logout" onClick={onLogout}>
                Déconnexion
              </button>
            )}
          </div>
        )}

        <div className="hud-title">Itinéraire (Lyon → Ambérieu-en-Bugey)</div>

        <div className="hud-sub">
          🔴 Route : {fmtKm(metrics?.distance)} • {fmtMin(metrics?.duration)}
        </div>

        <div className="hud-section">
          <div className="hud-section-title">Fond de carte</div>
          <select
            className="hud-select"
            value={basemapId}
            onChange={(e) => {
              const next = e.target.value as BasemapId;
              setBasemapId(next);
              switchBasemap(next);
            }}
          >
            {Object.entries(BASEMAPS).map(([id, v]) => (
              <option key={id} value={id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="hud-section">
          <div className="hud-section-title">Ajout de points</div>
          <div className="hud-sub">Clic droit sur la carte → ouvre la modal OTAN</div>
        </div>
      </div>
    </div>
  );
};

export default CoreApp;
