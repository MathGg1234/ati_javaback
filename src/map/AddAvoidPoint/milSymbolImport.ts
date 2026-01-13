import ms from "milsymbol";

export type MakeSymbolOptions = {
    sizePx?: number;
    fillColor?: string;
};

export function makeSymbolSvg(sidc: string, opts: MakeSymbolOptions = {}) {
    const {
        sizePx = 70,
        fillColor,
    } = opts;

    const sym = new ms.Symbol(sidc, {
        size: sizePx,
        ...(fillColor ? { fillColor } : {}),
    });

    return sym.asSVG();
}
