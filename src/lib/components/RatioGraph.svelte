<script lang="ts">
    import { milestones } from "$lib/utils/graph.ts";
    import { TimelineChart, makeSeries, seriesColors, formatPercent } from "$lib/components/charts";
    import type { TimelineChartSpec } from "$lib/components/charts/types";
    import ChartCard from "$lib/components/ChartCard.svelte";

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
        series: makeSeries([
            { key: "lazer", label: "lazer%", color: seriesColors.lazer, field: "value" },
        ]),
        title: name,
        xFormat: is24h ? "hour" : "month",
        yDomain: [0, 100],
        yTicks: 5,
        yTickFormat: formatPercent,
        itemFormat: formatPercent,
        annotations: is24h ? [] : milestones,
    }));
</script>

<ChartCard centered>
    <TimelineChart {spec} />
</ChartCard>
