<script lang="ts">
    import { milestones } from "$lib/utils/graph.ts";
    import { TimelineChart, seriesColors, formatPercent } from "$lib/charts";
    import type { TimelineChartSpec } from "$lib/charts/types";

    let {
        timestamps,
        values,
        name,
        is24h,
    }: {
        timestamps: number[];
        values: number[];
        name: string;
        is24h?: boolean;
    } = $props();

    const rows = $derived(
        timestamps.map((ts, i) => ({
            timestamp: ts,
            value: values[i],
        })),
    );

    const spec: TimelineChartSpec = $derived.by(() => ({
        rows,
        x: (d: any) => new Date(d.timestamp * 1000),
        series: [
            {
                key: "lazer",
                label: "lazer%",
                color: seriesColors.lazer,
                value: (d: any) => d.value,
            },
        ],
        title: name,
        xFormat: is24h ? "hour" : "month",
        yDomain: [0, 100],
        yTicks: 5,
        yTickFormat: formatPercent,
        annotations: is24h ? [] : milestones,
    }));
</script>

<div style="height: 480px; max-width: 700px; padding: 15px 10px; width: 100%;">
    <TimelineChart {spec} />
</div>