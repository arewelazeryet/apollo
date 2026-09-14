<script lang="ts">
    import { LineChart } from "layerchart/svg";

    import ChartFrame from "./ChartFrame.svelte";
    import ChartTooltip from "./ChartTooltip.svelte";
    import { zoomConfig, formatInteger } from "./config.ts";
    import { palette } from "./theme.ts";
    import { useBoxZoom } from "./zoom.svelte.ts";
    import type { TimelineChartSpec } from "./types.ts";
    import { AnnotationLine } from "layerchart";

    // Annotation label layout: ~6px of text per character at the 10px font
    // below, so colliding labels drop to the next 14px-high row.
    const ANN_FONT_SIZE = 10;
    const ANN_CHAR_PX = 5.6;
    const ANN_ROW_H = 14;

    let { spec }: { spec: TimelineChartSpec } = $props();

    const yMax = $derived.by(() => {
        if (spec.yDomain) return spec.yDomain[1];
        let hi = 0;
        for (const r of spec.rows) {
            for (const s of spec.series) hi = Math.max(hi, s.value(r));
        }
        return hi;
    });

    const xExtent = $derived.by(() => {
        let lo = Infinity;
        let hi = -Infinity;
        for (const r of spec.rows) {
            const t = spec.x(r).getTime();
            if (t < lo) lo = t;
            if (t > hi) hi = t;
        }
        return [new Date(lo), new Date(hi)];
    });

    const zoom = useBoxZoom();

    $effect(() => {
        zoom.setBase({
            x: xExtent,
            y: [0, yMax],
            clampYMax: spec.yDomain?.[1] ?? yMax,
        });
    });

    const layerSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            value: s.value,
        })),
    );

    let plotEl = $state<HTMLElement>();
    let plotW = $state(0);

    $effect(() => {
        const el = plotEl;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            plotW = el.clientWidth;
        });
        ro.observe(el);
        plotW = el.clientWidth;
        return () => {
            ro.disconnect();
        };
    });

    const annotations = $derived.by(() => {
        const anns = spec.annotations ?? [];
        if (!anns.length) return [];
        // Estimate pixel positions across the plot; top-right labels hang down
        // from the top edge, so a per-annotation labelYOffset stacks the rows.
        const [t0, t1] = xExtent;
        const span = Math.max(1, t1.getTime() - t0.getTime());
        const W = plotW || 1100;
        const textW = (label: string) => Math.min(320, Math.max(28, label.length * ANN_CHAR_PX + 12));
        const rows: { a: number; b: number }[][] = [];
        const placed: { date: Date; label: string; offset: number }[] = [];
        for (const a of anns) {
            const date = new Date(a.date);
            const x0 = ((date.getTime() - t0.getTime()) / span) * W;
            const x1 = x0 + textW(a.label);
            let row = 0;
            while (row < rows.length && rows[row].some((iv) => x0 < iv.b && x1 > iv.a)) row++;
            if (row === rows.length) rows.push([]);
            rows[row].push({ a: x0, b: x1 });
            placed.push({ date, label: a.label, offset: row * ANN_ROW_H });
        }
        return placed.map((p) => ({
            type: "line" as const,
            x: p.date,
            label: p.label,
            labelPlacement: "top-right" as const,
            labelYOffset: p.offset,
            props: {
                line: { stroke: palette.milestone, strokeOpacity: 0.5, strokeWidth: 1 },
                label: {
                    font: { size: ANN_FONT_SIZE },
                    fill: palette.text,
                    stroke: palette.halo,
                    strokeWidth: 4,
                },
            },
        }) as AnnotationLine);
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
    <div bind:this={plotEl} class="lc-measure">
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
            transform={zoomConfig.transform}
            brush={{ axis: "both", zoomOnBrush: true, onBrushEnd: zoom.onBrushEnd }}
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
