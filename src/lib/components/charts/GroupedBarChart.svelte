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
        for (const row of spec.rows) {
            const x = spec.x(row);
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

    const layerSeries = $derived(
        spec.series.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
        })),
    );

    const tooltipSeries = $derived(
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
    legend={layerSeries}
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
                <!-- layerchart's highlight circles sit at the band center (no
                     x1 sub-band, hence `highlight={{ points: false }}`), so the
                     tooltip marker is drawn per sub-bar below. -->
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
