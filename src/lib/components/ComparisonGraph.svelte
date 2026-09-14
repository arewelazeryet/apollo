<script lang="ts">
    import TimelineChart from "$lib/components/charts/TimelineChart.svelte";
    import { milestones } from "$lib/utils/graph.ts";
    import { makeSeries, seriesColors, formatInteger } from "$lib/components/charts";
    import type { TimelineChartSpec } from "$lib/components/charts/types";
    import ChartCard from "$lib/components/ChartCard.svelte";

    let {
        timestamps,
        stable,
        lazer,
        sum,
        name,
        is24h,
    }: {
        timestamps: number[];
        stable: number[];
        lazer: number[];
        sum: number[];
        name: string;
        is24h?: boolean;
    } = $props();

    const rows = $derived(
        timestamps.map((ts, i) => ({
            timestamp: ts,
            stable: stable[i],
            lazer: lazer[i],
            sum: sum[i],
        })),
    );

    const spec: TimelineChartSpec = $derived.by(() => ({
        rows,
        x: (d: any) => new Date(d.timestamp * 1000),
        series: makeSeries([
            { key: "stable", color: seriesColors.stable },
            { key: "lazer", color: seriesColors.lazer },
            { key: "total", color: seriesColors.total, field: "sum" },
        ]),
        title: name,
        xFormat: is24h ? "hour" : "day",
        yDomain: [0, 25000],
        yTickFormat: formatInteger,
        itemFormat: formatInteger,
        annotations: is24h ? [] : milestones,
    }));
</script>

<ChartCard centered>
    <TimelineChart {spec} />
</ChartCard>
