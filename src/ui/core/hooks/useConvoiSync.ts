import { useEffect, useRef } from "react";
import type { LngLat } from "../../../domain/routing/types";
import { fetchConvoiDto, updateConvoiPosition, type ConvoiDto } from "../../../infra/backend/convoiStateRepo";

export function useConvoiSync(opts: {
    token?: string;
    isDriver: boolean;
    convoiPosRef: React.MutableRefObject<LngLat>;
    onRemotePos?: (p: LngLat) => void;
}) {
    const { token, isDriver, convoiPosRef, onRemotePos } = opts;

    const pullMs = Number(import.meta.env.VITE_CONVOI_PULL_MS ?? 1000);
    const pushMs = Number(import.meta.env.VITE_CONVOI_PUSH_MS ?? 1000);

    const runningPullRef = useRef(false);
    const runningPushRef = useRef(false);

    const lastDtoRef = useRef<ConvoiDto | null>(null);

    // anti spam console
    const lastPullErrRef = useRef(0);
    const lastPushErrRef = useRef(0);

    const asNum = (v: any): number | null => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    // ✅ PULL : on pull même en driver (ça aide à vérifier que le backend bouge bien)
    useEffect(() => {
        if (!token) return;

        runningPullRef.current = true;

        const tick = async () => {
            if (!runningPullRef.current) return;

            try {
                const dto = await fetchConvoiDto(token);
                lastDtoRef.current = dto;

                const lng = asNum(dto?.position?.lng);
                const lat = asNum(dto?.position?.lat);

                if (lng !== null && lat !== null) {
                    const p: LngLat = [lng, lat];
                    convoiPosRef.current = p;

                    // ✅ rend réactif côté UI (suiveurs)
                    onRemotePos?.(p);
                }
            } catch (e) {
                const now = Date.now();
                if (now - lastPullErrRef.current > 2000) {
                    lastPullErrRef.current = now;
                    console.error("[ConvoiSync:PULL] échec GET convoi:", e);
                }
            } finally {
                setTimeout(tick, Math.max(250, pullMs));
            }
        };

        tick();

        return () => {
            runningPullRef.current = false;
        };
    }, [token, pullMs, convoiPosRef, onRemotePos]);

    // ✅ PUSH : uniquement si driver (écrit en backend)
    useEffect(() => {
        if (!token) return;

        if (!isDriver) {
            runningPushRef.current = false;
            return;
        }

        runningPushRef.current = true;

        const tick = async () => {
            if (!runningPushRef.current) return;

            try {
                const [lng, lat] = convoiPosRef.current;

                // ✅ update fiable via PUT /api/v1/convoi/{id}/
                const saved = await updateConvoiPosition(token, lng, lat);
                lastDtoRef.current = saved;
            } catch (e) {
                const now = Date.now();
                if (now - lastPushErrRef.current > 2000) {
                    lastPushErrRef.current = now;
                    console.error("[ConvoiSync:PUSH] échec PUT position convoi:", e);
                }
            } finally {
                setTimeout(tick, Math.max(250, pushMs));
            }
        };

        tick();

        return () => {
            runningPushRef.current = false;
        };
    }, [token, isDriver, pushMs, convoiPosRef]);
}
