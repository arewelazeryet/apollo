<script lang="ts">
    import TimelineChart from "$lib/charts/TimelineChart.svelte";
    import { milestones } from "$lib/utils/graph.ts";
    import { seriesColors, formatInteger } from "$lib/charts";
    import type { TimelineChartSpec } from "$lib/charts/types";

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
        series: [
            {
                key: "stable",
                label: "stable",
                color: seriesColors.stable,
                value: (d: any) => d.stable,
            },
            {
                key: "lazer",
                label: "lazer",
                color: seriesColors.lazer,
                value: (d: any) => d.lazer,
            },
            {
                key: "total",
                label: "total",
                color: seriesColors.total,
                value: (d: any) => d.sum,
            },
        ],
        title: name,
        xFormat: is24h ? "hour" : "month",
        yDomain: [0, 25000],
        yTickFormat: formatInteger,
        itemFormat: formatInteger,
        annotations: is24h ? [] : milestones,
    }));
</script>

<div style="height: 480px; max-width: 700px; padding: 15px 10px; width: 100%">
    <TimelineChart {spec} />
</div>