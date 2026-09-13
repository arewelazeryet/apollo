import type { ChartState } from "layerchart";

/**
 * Correct drag-box zoom for LayerChart charts that also use `transform`
 * (wheel/pinch).
 *
 * LayerChart's integrated brush→zoom (`transform.mode === 'domain'`) derives one
 * uniform scale from the brushed x range and applies it to both axes, so the
 * resulting view is stretched/shifted on the y axis unless selection happens to
 * be proportional. It also interprets a selection made while already zoomed
 * against the *base* domain, compounding the offset. We still rely on the
 * internal handler to wire the gesture up, but we take over on `onBrushEnd`
 * and resolve an exact, per-axis domain directly.
 */
export function useBoxZoom(opts: { yMin?: number; yMax?: number } = {}) {
    let chart = $state<ChartState | null>(null);
    let base = $state<{ x: any[]; y: any[] } | null>(null);

    $effect(() => {
        if (chart && !base && chart._baseXDomain && chart._baseYDomain) {
            base = {
                x: [...chart._baseXDomain],
                y: [...chart._baseYDomain],
            };
        }
    });

    function onBrushEnd(e: {
        brush: {
            x: [any, any];
            y: [any, any];
            active: boolean;
        };
    }) {
        const ctx = chart;
        if (!ctx) return;

        const b = e.brush;
        if (!b.active) {
            ctx.brushXDomain = undefined;
            ctx.brushYDomain = undefined;
            ctx.transformState?.reset();
            return;
        }

        const baseX = base?.x;
        const baseY = base?.y;

        const bx = orderedPair(b.x, baseX);
        ctx.brushXDomain = bx
            ? [
                  clampDomain(bx[0], baseX),
                  clampDomain(bx[1], baseX),
              ]
            : undefined;

        const by = orderedPair(b.y, baseY);
        if (by && baseY) {
            const yMin = Math.max(0, opts.yMin ?? Number(baseY[0]));
            const yMax = opts.yMax ?? Number(baseY[baseY.length - 1]);
            let [low, high] = by.map((v) => Number(v));
            low = clampNum(low, yMin, yMax);
            high = clampNum(high, yMin, yMax);
            if (!isFinite(low) || !isFinite(high)) {
                ctx.brushYDomain = undefined;
            } else {
                ctx.brushYDomain = [Math.min(low, high), Math.max(low, high)];
            }
        } else {
            ctx.brushYDomain = undefined;
        }

        // The internal branch already ran `zoomToBrush`; snap the transform back to
        // an identity so the brush domains above are rendered exactly (same tick,
        // so there is no flash of the misaligned intermediate state).
        ctx.transformState?.reset();
    }

    return { chart, onBrushEnd };
}

function orderedPair([a, b]: [any, any], domain?: any[]): any[] | null {
    if (a == null || b == null) return null;
    if (typeof a === "number" && typeof b === "number") {
        return [Math.min(a, b), Math.max(a, b)];
    }
    if (a instanceof Date && b instanceof Date) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        return [lo, hi];
    }
    if (Array.isArray(domain) && domain.length > 0) {
        const i0 = domain.indexOf(a);
        const i1 = domain.indexOf(b);
        if (i0 >= 0 && i1 >= 0) {
            return [domain[Math.min(i0, i1)], domain[Math.max(i0, i1)]];
        }
    }
    return [a, b];
}

function clampDomain(value: any, domain?: any[]): any {
    if (!domain || domain.length === 0) return value;
    if (typeof value === "number") {
        return clampNum(value, Number(domain[0]), Number(domain[domain.length - 1]));
    }
    if (value instanceof Date) {
        const lo = new Date(domain[0]).getTime();
        const hi = new Date(domain[domain.length - 1]).getTime();
        return new Date(clampNum(value.getTime(), lo, hi));
    }
    const idx = domain.indexOf(value);
    if (idx < 0) return value;
    return domain[idx];
}

function clampNum(value: number, min: number, max: number): number {
    if (!isFinite(min) && isFinite(max)) return Math.min(value, max);
    if (isFinite(min) && !isFinite(max)) return Math.max(value, min);
    if (!isFinite(min) && !isFinite(max)) return value;
    return Math.max(min, Math.min(max, value));
}