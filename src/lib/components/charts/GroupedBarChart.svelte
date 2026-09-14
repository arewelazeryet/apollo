<script lang="ts">
    import { BarChart, Bars } from "layerchart/svg";
    import { scaleBand } from "d3-scale";

    import ChartFrame from "./ChartFrame.svelte";
    import ChartTooltip from "./ChartTooltip.svelte";
    import { formatInteger } from "./config.js";
    import { palette } from "./theme.js";
    import { useBoxZoom } from "./zoom.svelte.js";
    import type { BarChartSpec } from "./types.js";

    let { spec }: { spec: BarChartSpec } = $props();

    const distinctX = $derived.by(() => {
        const set = new Set<any>();
        for (const r of spec.rows) {
            const x = spec.x(r);
            if (x instanceof Date) {
                set.add(x);
            } else {
                set.add(String(x));
            }
        }
        const sorted = [...set].sort((a, b) =>
            a instanceof Date && b instanceof Date ? a.getTime() - b.getTime() : String(a) < String(b) ? -1 : 1,
        );
        return sorted;
    });

    const yMax = $derived.by(() => {
        if (spec.yMax != null) return spec.yMax;
        let hi = 0;
        for (const r of spec.rows) {
            for (const s of spec.series) hi = Math.max(hi, s.value(r));
        }
        return hi;
    });

    const zoom = useBoxZoom();

    $effect(() => {
        zoom.setBase({ x: distinctX, y: [0, yMax] });
    });

    // LayerChart's grouped-bar layout derives the sub-band ("x1") from the
    // series key itself (`value ?? key`), and reads a bar's height / tooltip
    // value from the same key as a data field. So rows stay wide (one row per
    // bucket with a per-series field each) and series carry NO value accessor —
    // a value accessor makes `value ?? key` return the accessor function and
    // collapses every series onto the same sub-band.
    // LayerChart's highlight points all sit at band center (they have no x1
    // sub-band), so the marks snippet renders its own per-bar highlight circles.
    const layerSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
        })),
    );

    // The tooltip wants the value accessors back, and ChartFrame wants the
    // legend swatches — derive both once so the template doesn't re-map.
    const tooltipSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            value: s.value,
        })),
    );

    const seriesMeta = $derived(tooltipSeries.map((s) => ({ label: s.label, color: s.color })));

    const header = $derived((d: any) => {
        const x = spec.x(d);
        return x instanceof Date
            ? x.toLocaleString("en-US", { month: "short", year: "numeric" })
            : String(x);
    });

    /// The top of the bar for `key` at the hovered row: sub-band x-position
    /// (`x1Scale`) plus half its width for the group layout, at y = value
    /// (the y scale is reversed, so that's the bar top).
    function barCenter(context: any, key: string, value: number) {
        const x1 = context.x1Scale;
        const bandX = context.xScale(context.x(context.tooltip.data));
        const subW = x1 ? x1.bandwidth() : ((context.xScale as any).bandwidth?.() ?? 0);
        return {
            x: bandX + (x1 ? x1(key) : 0) + subW / 2,
            y: context.yScale(value),
        };
    }
</script>

<ChartFrame
    title={spec.title}
    height={spec.height ?? 480}
    legend={seriesMeta}
>
    <BarChart
        data={spec.rows}
        x={spec.x}
        xScale={scaleBand()}
        series={layerSeries}
        seriesLayout={spec.series.length > 1 ? "group" : "auto"}
        tooltipContext={{ mode: "band" }}
        highlight={{ points: false, area: false }}
        grid={{
            x: { stroke: palette.grid, strokeWidth: 2 },
            y: { stroke: palette.grid, strokeWidth: 2 },
        }}
        legend={false}
        yDomain={spec.yMax != null ? [0, spec.yMax] : undefined}
        props={{
            xAxis: {
                placement: "bottom",
                fill: palette.text,
                stroke: palette.border,
                ticks: 10,
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
        brush={{ axis: "both", zoomOnBrush: true, onBrushEnd: zoom.onBrushEnd }}
    >
        {#snippet tooltip({ context })}
            <ChartTooltip {context} {header} series={tooltipSeries} formatValue={spec.itemFormat ?? formatInteger} />
        {/snippet}
        {#snippet marks({ context })}
            {#each context.series.visibleSeries as s (s.key)}
                <Bars
                    seriesKey={s.key}
                    x1={() => s.key}
                    radius={0}
                    strokeWidth={1}
                />
            {/each}
            {#if context.tooltip.data}
                {#each context.tooltip.series as s}
                    {#if s.visible !== false && s.value != null}
                        {@const g = barCenter(context, s.key, s.value)}
                        <circle
                            cx={g.x}
                            cy={g.y}
                            r={4}
                            fill={s.color}
                            stroke="#fff"
                            stroke-width={5}
                            style="pointer-events: none; paint-order: stroke"
                        />
                    {/if}
                {/each}
            {/if}
        {/snippet}
    </BarChart>
</ChartFrame>
