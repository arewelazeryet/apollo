import type { BrushState, ChartState, BrushDomainType } from "layerchart";

type ZoomBase = {
    x: BrushDomainType;
    y: BrushDomainType,
    clampYMax?: number
}

export function useBoxZoom() {
    let base = $state<ZoomBase | null>(null);

    function setBase(next: ZoomBase) {
        base = next;
    }

    function onBrushEnd(event: { brush: BrushState }) {
        // Value is narrowed at runtime, it's full in reality
        const ctx = event.brush.ctx as ChartState | null;
        if (!ctx) return;

        if (!event.brush.active) {
            ctx.brushXDomain = undefined;
            ctx.brushYDomain = undefined;
            ctx.transformState?.reset();
            return;
        }

        const baseX = base?.x;
        const baseY = base?.y;
        const clampYMax = base?.clampYMax;

        const bx = event.brush.x;
        const by = event.brush.y;

        if (bx[0] != null && bx[1] != null) {
            if (baseX && baseX.length > 2) {
                const i0 = baseX.indexOf(bx[0]);
                const i1 = baseX.indexOf(bx[1]);
                ctx.brushXDomain =
                    i0 >= 0 && i1 >= 0
                        ? baseX.slice(Math.min(i0, i1), Math.max(i0, i1) + 1)
                        : orderedPair(bx, baseX);
            } else {
                ctx.brushXDomain = orderedPair(bx, baseX ?? []);
            }
        } else {
            ctx.brushXDomain = undefined;
        }

        if (by[0] != null && by[1] != null && baseY) {
            const yMax = clampYMax ?? baseY[1];
            const p = orderedPair(by, baseY);
            let lo = Number(p[0]);
            let hi = Number(p[1]);
            if (!isFinite(lo) || !isFinite(hi)) {
                ctx.brushYDomain = undefined;
            } else {
                ctx.brushYDomain = [Math.max(0, Math.min(lo, hi)), Math.max(0, Math.min(Math.max(lo, hi), yMax as number))];
            }
        } else {
            ctx.brushYDomain = undefined;
        }

        ctx.transformState?.reset();
    }

    return { setBase, onBrushEnd };
}

function orderedPair(pair: (number | Date | string | null)[], _domain?: any[]): [BrushDomainType[number], BrushDomainType[number]] {
    const a = pair[0];
    const b = pair[1];
    if (a == null || b == null) return [a as any, b as any];
    if (typeof a === "number" && typeof b === "number") {
        return a <= b ? [a, b] : [b, a];
    }
    if (a instanceof Date || b instanceof Date) {
        return new Date(a).getTime() <= new Date(b).getTime() ? [a, b] : [b, a];
    }
    return [a, b];
}
