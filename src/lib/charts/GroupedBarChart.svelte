<script lang="ts">
    import { BarChart } from "layerchart/svg";
    import { scaleBand } from "d3-scale";

    import ChartFrame from "./ChartFrame.svelte";
    import ChartTooltip from "./ChartTooltip.svelte";
    import { zoomConfig, formatInteger } from "./config.js";
    import { palette } from "./theme.js";
    import { useBoxZoom } from "./zoom.svelte.js";
    import type { BarChartSpec } from "./types.js";

    let { spec }: { spec: BarChartSpec } = $props();

    const zoom = useBoxZoom(
        spec.yMax != null ? { yMin: 0, yMax: spec.yMax } : { yMin: 0 },
    );

    const layerSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            value: s.value,
        })),
    );

    const header = $derived((d: any) => {
        const x = spec.x(d);
        return x instanceof Date
            ? x.toLocaleString("en-US", { month: "short", year: "numeric" })
            : String(x);
    });
</script>

<ChartFrame
    title={spec.title}
    height={spec.height ?? 480}
    legend={spec.series.map((s) => ({ label: s.label, color: s.color }))}
>
bind:context={zoom.chart}
    <BarChart
        data={spec.rows}
        x={spec.x}
        xScale={scaleBand()}
        series={layerSeries}
        seriesLayout={spec.series.length > 1 ? "group" : "auto"}
        tooltipContext={{ mode: "band" }}
        highlight={{ points: true }}
        grid={{
            x: { stroke: palette.grid, strokeWidth: 2 },
            y: { stroke: palette.grid, strokeWidth: 2 },
        }}
        legend={false}
        yDomain={spec.yMax != null ? [0, spec.yMax] : undefined}
        props={{
            bars: { radius: 0 },
            xAxis: {
                placement: "bottom",
                fill: palette.text,
                stroke: palette.border,
            },
            yAxis: {
                placement: "left",
                fill: palette.text,
                stroke: palette.border,
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
                formatValue={spec.itemFormat ?? formatInteger}
            />
        {/snippet}
    </BarChart>
</ChartFrame>