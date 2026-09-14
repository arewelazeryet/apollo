<script lang="ts">
    import { LineChart } from "layerchart/svg";
    import type { BrushState, ChartState, BrushDomainType } from "layerchart";

    import ChartFrame from "./ChartFrame.svelte";
    import ChartTooltip from "./ChartTooltip.svelte";
    import { formatInteger } from "./config.ts";
    import { palette } from "./theme.ts";
    import type { TimelineChartSpec } from "./types.ts";

    // Annotation label layout: ~5.6px of text per character at the 10px font
    // below, so colliding labels drop to the next 24px-high row.
    const ANN_FONT_SIZE = 10;
    const ANN_CHAR_PX = 5.6;
    const ANN_ROW_H = 24;

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

    // Date range for X
    const xExtent = $derived.by(() => {
        let lo = Infinity;
        let hi = -Infinity;
        for (const r of spec.rows) {
            const t = spec.x(r).getTime();
            if (t < lo) lo = t;
            if (t > hi) hi = t;
        }
        return [new Date(lo), new Date(hi)];
    }) as [Date, Date];

    const layerSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            value: s.value,
        })),
    );

    // The element is actually used, TS lang server doesn't see the Svelte reference
    let plotElement = $state<HTMLElement>();
    let plotWidth = $state(0);

    const annotations = $derived.by(() => {
        const list = spec.annotations ?? [];
        if (!list.length) return [];

        // Estimate positions in plot pixels: time mapped across the width, and each label measured at
        // ANN_CHAR_PX per char on the ANN_FONT_SIZE font (clamped to 28-320px).
        const [xStart, xEnd] = xExtent;
        const width = plotWidth || 1100; // fallback until the plot is measured
        const toPx = (date: Date) =>
            ((date.getTime() - xStart.getTime()) / Math.max(1, xEnd.getTime() - xStart.getTime())) * width;
        const labelSpan = (label: string) =>
            Math.min(320, Math.max(28, label.length * ANN_CHAR_PX + 120));

        // Pack colliding spans: each [x, xEnd) goes into the first row that spans fit in,
        // otherwise a new row starts ANN_ROW_H lower.
        const rows: { date: Date; label: string; x: number; xEnd: number }[][] = [];
        for (const annotation of list) {
            const date = new Date(annotation.date);
            const x = toPx(date);
            const xEnd = x + labelSpan(annotation.label);
            let row = rows.findIndex((labels) => labels.every((l) => xEnd <= l.x || x >= l.xEnd));
            if (row === -1) {
                row = rows.length;
                rows.push([]);
            }
            rows[row].push({ date, label: annotation.label, x, xEnd });
        }

        // Flatten the rows into AnnotationLine items, use index as height
        return rows.flatMap((row, rowIndex) =>
            row.map(({ date, label }) => ({
                type: "line" as const,
                x: date,
                label,
                labelPlacement: "top-right" as const,
                labelYOffset: rowIndex * ANN_ROW_H,
                props: {
                    line: { stroke: palette.milestone, strokeOpacity: 0.5, strokeWidth: 1 },
                    label: { font: { size: ANN_FONT_SIZE }, fill: palette.text, stroke: palette.halo, strokeWidth: 4 },
                },
            })),
        );
    });

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
    <div bind:this={plotElement} class="lc-measure">
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
