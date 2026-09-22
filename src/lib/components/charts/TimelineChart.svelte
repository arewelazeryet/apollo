<script lang="ts">
    import { LineChart } from "layerchart/svg";
    import type { BrushState, ChartState, BrushDomainType } from "layerchart";

    import ChartFrame from "./ChartFrame.svelte";
    import ChartTooltip from "./ChartTooltip.svelte";
    import { formatInteger } from "./config.ts";
    import { palette } from "./theme.ts";
    import type { TimelineChartSpec } from "./types.ts";

    const ANN_FONT_SIZE = 16;

    let { spec }: { spec: TimelineChartSpec } = $props();

    // Highest element by Y
    const yMax = $derived.by(() => {
        if (spec.yDomain) return spec.yDomain[1];
        let hi = 0;
        for (const r of spec.rows) {
            for (const s of spec.series) hi = Math.max(hi, s.value(r));
        }
        return hi;
    });

    // Box zoom: the brushed box becomes the visible domain via layerchart's chart-state brush
    // domains, which take precedence over the `yDomain` prop in `resolveDomain`. Axis-agnostic —
    // continuous time X needs no band slicing, and Y is clamped to [0, yMax].
    function onBrushEnd(event: { brush: BrushState }) {
        const ctx = event.brush.ctx as ChartState | null;
        if (!ctx) return;

        if (!event.brush.active) {
            ctx.brushXDomain = undefined;
            ctx.brushYDomain = undefined;
            return;
        }

        const bx = event.brush.x;
        const by = event.brush.y;
        ctx.brushXDomain = bx[0] != null && bx[1] != null ? orderedPair(bx) : undefined;
        if (by[0] != null && by[1] != null) {
            const [lo, hi] = orderedPair(by);
            ctx.brushYDomain = [Math.max(0, Number(lo)), Math.max(0, Math.min(Number(hi), yMax))];
        } else {
            ctx.brushYDomain = undefined;
        }
    }

    function orderedPair(pair: BrushDomainType): [BrushDomainType[number], BrushDomainType[number]] {
        const [a, b] = pair;
        if (a == null || b == null) return [a, b];
        return +a <= +b ? [a, b] : [b, a];
    }

    const layerSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            value: s.value,
        })),
    );

    const annotations = $derived(
        (spec.annotations ?? []).map((annotation) => ({
            type: "line" as const,
            x: new Date(annotation.date),
            label: annotation.label,
            labelPlacement: "top" as const,
            props: {
                line: { stroke: palette.milestone, strokeOpacity: 0.5, strokeWidth: 1 },
                label: {
                    font: { size: ANN_FONT_SIZE },
                    fill: palette.text,
                    stroke: palette.halo,
                    strokeWidth: 3,
                    rotate: -90,
                    dy: 5,
                    dx: -3,
                    textAnchor: 'end',
                    verticalAnchor: 'end'
                },
            },
        })),
    );

    const header = $derived((d: any) => {
        const ts = spec.x(d);
        if (spec.xFormat === "hour") {
            return ts.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        if (spec.xFormat === "day") {
            return ts.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
        return ts.toLocaleString("en-US", { month: "short", year: "numeric" });
    });
</script>

<ChartFrame
    title={spec.title}
    height={spec.height ?? 480}
    legend={spec.series.map((s) => ({ label: s.label, color: s.color }))}
>
    <div class="lc-measure">
        <LineChart
            data={spec.rows}
            x={spec.x}
            series={layerSeries}
            tooltipContext={{ mode: "bisect-x" }}
            grid={{
                x: { stroke: palette.grid, strokeWidth: 2 },
                y: { stroke: palette.grid, strokeWidth: 2 },
            }}
            {annotations}
            legend={false}
            yDomain={[0, yMax]}
            props={{
                spline: { strokeWidth: 2 },
                xAxis: {
                    placement: "bottom",
                    fill: palette.text,
                    stroke: palette.border,
                },
                yAxis: {
                    placement: "left",
                    fill: palette.text,
                    stroke: palette.border,
                    ticks: spec.yTicks,
                    format: spec.yTickFormat
                        ? (v: any) => spec.yTickFormat!(Number(v))
                        : formatInteger,
                },
                tooltip: { hideTotal: true },
            }}
            brush={{ axis: "both", zoomOnBrush: true, onBrushEnd }}
        >
            {#snippet tooltip({ context })}
                <ChartTooltip
                    {context}
                    {header}
                    series={layerSeries}
                    formatValue={spec.itemFormat ?? formatInteger}
                    hideZeros={spec.hideZeros}
                />
            {/snippet}
        </LineChart>
    </div>
</ChartFrame>

<style>
    .lc-measure {
        width: 100%;
        height: 100%;
        min-height: 0;
        min-width: 0;
    }
</style>
