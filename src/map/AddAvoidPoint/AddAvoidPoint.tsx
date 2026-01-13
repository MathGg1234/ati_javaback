
import React, { useMemo, useState } from "react";
import type { LngLat } from "../../core/types.ts";
import "./AddAvoidPoint.css";
import { ICON_CATALOG } from "./otanSymbol.ts";
import { makeSymbolSvg } from "./milSymbolImport.ts";

export type PointType = "1 à 3" | "3 à 7" | "7 à 30";
const pointTypes: PointType[] = ["1 à 3", "3 à 7", "7 à 30"];
/**
 * ✅ Payload envoyé à App
 * - selectedSidc: SIDC du symbole choisi → App pourra générer le SVG et l'afficher sur la map
 */
export type ModalPointPayload = {
    p: LngLat;
    selectedSidc: string;
    pointName: string;
    pointType: PointType;
};

type ModalProps = {
    isOpen: boolean;
    point: LngLat | null;
    onClose: () => void;
    onSubmit: (payload: ModalPointPayload) => void | Promise<void>;
};

/** Petit SVG fallback quand sidc est vide */
function fallbackSvg(sizePx: number, label = "?") {
    const s = Math.max(24, sizePx);
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64">
      <rect x="6" y="6" width="52" height="52" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.20)" />
      <text x="32" y="40" text-anchor="middle" font-size="28" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif">${label}</text>
    </svg>
  `;
}

/** Safe wrapper: si sidc vide → fallback, sinon milsymbol */
function safeSymbolSvg(sidc: string, sizePx: number) {
    if (!sidc || !sidc.trim()) return fallbackSvg(sizePx);
    try {
        return makeSymbolSvg(sidc, { sizePx });
    } catch {
        return fallbackSvg(sizePx, "!");
    }
}

function SvgIcon({ svg }: { svg: string }) {
    return <span className="fmp-svg" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function AddAvoidPointWizard(props: ModalProps) {
    const { isOpen, point, onClose, onSubmit } = props;

    const [step, setStep] = useState<1 | 2>(1);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [pointName, setPointName] = useState("");
    const [pointType, setPointType] = useState<PointType>("1 à 3");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMoreSubs, setShowMoreSubs] = useState(false);


    const selectedBlock = useMemo(
        () => ICON_CATALOG.find((b) => b.main.sidc === selectedCategory) ?? null,
        [selectedCategory]
    );

    const visibleSubs = useMemo(() => {
        if (!selectedBlock) return [];
        return showMoreSubs
            ? [...selectedBlock.subs, ...(selectedBlock.subsMore ?? [])]
            : selectedBlock.subs;
    }, [selectedBlock, showMoreSubs]);



    const selectedSymbolDef = useMemo(() => {
        if (!selectedBlock || !selectedSymbol) return null;
        return visibleSubs.find((s) => s.sidc === selectedSymbol) ?? null;
    }, [selectedBlock, selectedSymbol, visibleSubs]);


    const previewSvg = useMemo(() => {
        return selectedSymbolDef ? safeSymbolSvg(selectedSymbolDef.sidc, 120) : "";
    }, [selectedSymbolDef]);

    if (!isOpen || !point) return null;

    const closeAll = () => {
        onClose();
        setStep(1);
        setSelectedCategory("");
        setSelectedSymbol("");
        setPointName("");
        setPointType("1 à 3");
    };

    const pickCategory = (sidc: string) => {
        setSelectedCategory(sidc);
        setSelectedSymbol(""); // reset symbol quand catégorie change
        setShowMoreSubs(false);
    };

    const handleContinue = () => {
        if (!selectedSymbol) return;
        setStep(2);
    };

    const handleBack = () => setStep(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory || !selectedSymbol || !selectedSymbolDef) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                p: point,
                selectedSidc: selectedSymbolDef.sidc, // ✅ renvoyé à App
                pointName: pointName.trim(),
                pointType,
            });
            closeAll();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fmp-overlay" onMouseDown={closeAll}>
            <div className="fmp-modal" onMouseDown={(e) => e.stopPropagation()}>
                {/* Header commun */}
                <div className="fmp-topbar">
                    <div className="fmp-topbar-title">
                        {step === 1 ? "Ajouter un symbole OTAN" : "Configurer le point"}
                    </div>
                    <button type="button" className="fmp-close" onClick={closeAll} aria-label="Fermer" title="Fermer">
                        ✕
                    </button>
                </div>

                {/* ========================= STEP 1 ========================= */}
                {step === 1 && (
                    <div className="fmp-step fmp-step--1">
                        {/* Zone Catégories */}
                        <section className="fmp-panel">
                            <div className="fmp-panel-head">
                                <div className="fmp-panel-title">Catégories</div>
                                <div className="fmp-panel-subtitle">Choisis une catégorie</div>
                            </div>

                            <div className="fmp-grid fmp-grid--5" role="list" aria-label="Catégories">
                                {ICON_CATALOG.map((b) => {
                                    const active = b.main.sidc === selectedCategory;
                                    const svg = safeSymbolSvg(b.main.sidc, 50);

                                    return (
                                        <button
                                            key={b.main.sidc}
                                            type="button"
                                            className={`fmp-tile ${active ? "is-active" : ""}`}
                                            onClick={() => pickCategory(b.main.sidc)}
                                            aria-pressed={active}
                                            title={b.main.label}
                                        >
                                            <SvgIcon svg={svg} />
                                            <span className="fmp-tile-label">{b.main.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Divider clair */}
                        <div className="fmp-divider" role="separator" />

                        {/* Zone Symboles OTAN */}
                        <section className="fmp-panel fmp-panel--alt">
                            <div className="fmp-panel-head">
                                <div className="fmp-panel-title">Symboles OTAN</div>
                                <div className="fmp-panel-subtitle">
                                    {selectedBlock ? "Choisis un symbole" : "Sélectionne une catégorie au-dessus"}
                                </div>
                            </div>

                            {selectedBlock ? (
                                <div className="fmp-grid fmp-grid--5" role="list" aria-label="Symboles OTAN">
                                    {visibleSubs.map((s) => {
                                        const active = s.sidc === selectedSymbol;
                                        const svg = safeSymbolSvg(s.sidc, 54);

                                        return (
                                            <button
                                                key={s.sidc}
                                                type="button"
                                                className={`fmp-tile ${active ? "is-active is-active--blue" : ""}`}
                                                onClick={() => setSelectedSymbol(s.sidc)}
                                                aria-pressed={active}
                                                title={s.label}
                                            >
                                                <SvgIcon svg={svg} />
                                                <span className="fmp-tile-label">{s.label}</span>
                                            </button>
                                        );
                                    })}

                                    {!!selectedBlock?.subsMore?.length && !showMoreSubs && (
                                        <button
                                            type="button"
                                            className="fmp-tile fmp-tile--plus"
                                            onClick={() => setShowMoreSubs(true)}
                                            title="Afficher plus de symboles"
                                        >
                                            <span className="fmp-plus">+</span>
                                            <span className="fmp-tile-label">plus</span>
                                        </button>
                                    )}

                                </div>
                            ) : (
                                <div className="fmp-empty">Aucun symbole à afficher tant qu’une catégorie n’est pas choisie.</div>
                            )}
                        </section>

                        {/* Bouton Continuer: bas & centré */}
                        <div className="fmp-actions-center">
                            <button type="button" className="fmp-btn fmp-btn--primary" disabled={!selectedSymbol} onClick={handleContinue}>
                                Continuer
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================= STEP 2 ========================= */}
                {step === 2 && (
                    <form className="fmp-step" onSubmit={handleSubmit}>
                        <div className="fmp-two-col">
                            {/* Left preview */}
                            <div className="fmp-preview">
                                <div className="fmp-preview-card">
                                    <div className="fmp-preview-glyph">
                                        {selectedSymbolDef ? <SvgIcon svg={previewSvg} /> : <SvgIcon svg={fallbackSvg(120)} />}
                                    </div>
                                    <div className="fmp-preview-name">{selectedSymbolDef?.label ?? "Symbole"}</div>
                                </div>
                            </div>

                            {/* Right config */}
                            <div className="fmp-config">
                                <label className="fmp-field">
                                    <span className="fmp-label">Nom</span>
                                    <input
                                        className="fmp-input"
                                        value={pointName}
                                        onChange={(e) => setPointName(e.target.value)}
                                        placeholder="Nom du point"
                                        type="text"
                                        autoFocus
                                    />
                                </label>

                                <div className="fmp-field">
                                    <span className="fmp-label">Type</span>
                                    <div className="fmp-type-row" role="radiogroup" aria-label="Type du point">
                                        {pointTypes.map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                className={`fmp-type-btn ${pointType === type ? "is-selected" : ""}`}
                                                onClick={() => setPointType(type)}
                                                aria-pressed={pointType === type}
                                            >
                                                <span>{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bas de modale: Retour + Envoyer centrés */}
                        <div className="fmp-actions-center">
                            <button type="button" className="fmp-btn fmp-btn--ghost" onClick={handleBack}>
                                Retour
                            </button>

                            <button type="submit" className="fmp-btn fmp-btn--primary" disabled={isSubmitting}>
                                {isSubmitting ? "Envoi..." : "Envoyer"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

/** Hook d’intégration */
export function useAddAvoidPoint(args: { onSubmit: (payload: ModalPointPayload) => void | Promise<void> }) {
    const { onSubmit } = args;

    const [isOpen, setIsOpen] = useState(false);
    const [point, setPoint] = useState<LngLat | null>(null);

    const open = (p: LngLat) => {
        setPoint(p);
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    const Modal = <AddAvoidPointWizard isOpen={isOpen} point={point} onClose={close} onSubmit={onSubmit} />;

    return { open, close, Modal };
}

