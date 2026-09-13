<script lang="ts">
    import { LineChart } from "layerchart/svg";

    import ChartFrame from "./ChartFrame.svelte";
    import ChartTooltip from "./ChartTooltip.svelte";
    import { zoomConfig, formatInteger } from "./config.js";
    import { palette } from "./theme.js";
    import { useBoxZoom } from "./zoom.svelte.js";
    import type { TimelineChartSpec } from "./types.js";

    let { spec }: { spec: TimelineChartSpec } = $props();

    const zoom = $state(useBoxZoom(
        spec.yDomain ? { yMin: 0, yMax: spec.yDomain[1] } : { yMin: 0 },
    ));

    const layerSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            value: s.value,
        })),
    );

    const annotations = $derived(
        spec.annotations?.map((a) => ({
            type: "line" as const,
            x: new Date(a.date),
            label: a.label,
            labelPlacement: "top-right" as const,
            props: {
                line: { stroke: palette.milestone, strokeOpacity: 0.5, strokeWidth: 1 },
                label: { font: { size: 10 }, fill: palette.text },
            },
        })) ?? [],
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
        bind:context={zoom.chart}
    >
        {#snippet tooltip({ context })}
            <ChartTooltip
                {context}
                {header}
                formatValue={spec.itemFormat ?? formatInteger}
            />
        {/snippet}
    </LineChart>
</ChartFrame>
