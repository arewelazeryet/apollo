import type { BrushState } from "layerchart";

/**
 * Correct drag-box zoom for LayerChart charts.
 *
 * LayerChart's integrated brush→zoom when `transform.mode === 'domain'`
 * (`zoomToBrush`, Chart.base:452) builds one uniform scale from the brushed x
 * range and applies it to both axes, so the resulting view is stretched on the
 * y axis unless the selection box is proportional, and it interprets the
 * selection (made in current/zoomed domain coordinates) against the base
 * domain — pushing the view lower than selected, or even flipping the y domain
 * (negative bar heights). The `zoomOnBrush` path is exact but never clamps
 * below 0, and for band/x scales it zooms to just the two edge categories.
 *
 * We keep the gesture plumbing but take over in `onBrushEnd` (which runs after
 * layerchart's built-in handler) and write exact, per-axis domains:
 *  - x: for a time scale, the brushed range; for a band scale, every category
 *    between the brushed edges (mirroring `expandBandBrushDomain`).
 *  - y: the brushed range clamped so it never dips below `base.y[0]` (0).
 *
 * `base` is the full untransformed domain (computed from the chart's spec), so
 * it does not react to previously-applied zoom.
 */
export function useBoxZoom() {
    // Full untransformed domains, refreshed reactively from the chart's spec by
    // the calling component (`setBase` is called inside an `$effect`), so the
    // base never reacts to previously-applied zoom. `clamp` carries the
    // spec-provided axis ceilings, read in the same reactive context.
    let base = $state<{ x: any[]; y: [number, number]; clampYMax?: number } | null>(null);

    function setBase(next: { x: any[]; y: [number, number]; clampYMax?: number }) {
        base = next;
    }

    function onBrushEnd(e: { brush: BrushState }) {
        // Every BrushState holds its owning chart context (see brush.svelte.js).
        const ctx = (e.brush as any).ctx as any;
        if (!ctx) return;

        if (!e.brush.active) {
            ctx.brushXDomain = undefined;
            ctx.brushYDomain = undefined;
            ctx.transformState?.reset();
            return;
        }

        const baseX = base?.x;
        const baseY = base?.y;
        const clampYMax = base?.clampYMax;

        const bx = e.brush.x;
        const by = e.brush.y;

        if (bx[0] != null && bx[1] != null) {
            if (baseX && baseX.length > 2) {
                // Band scale: keep the category band between the brush edges so
                // bars stay at full bandwidth instead of two squished bars.
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
                ctx.brushYDomain = [Math.max(0, Math.min(lo, hi)), Math.max(0, Math.min(Math.max(lo, hi), yMax))];
            }
        } else {
            ctx.brushYDomain = undefined;
        }

        // The built-in handler (when a transform is in domain mode) already ran
        // `zoomToBrush`; snap the transform back to an identity so the per-axis
        // domains above render exactly. Same tick, so there is no intermediate
        // frame.
        ctx.transformState?.reset();
    }

    return { setBase, onBrushEnd };
}

function orderedPair(pair: (number | Date | string | null)[], _domain?: any[]): [any, any] {
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