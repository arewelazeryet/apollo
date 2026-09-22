<script lang="ts">
    import { formatInteger, makeSeries, seriesColors, type MilestoneAnnotation, type TimelineChartSpec } from "$components/charts";
    import TimelineChart from "$components/charts/TimelineChart.svelte";
    import type { PointLineResponse } from "$lib/server/backend.server";


    let { data }: { data: { changelogs: PointLineResponse }} = $props();

    const { timestamp, stable, lazer, sum } = $derived(data.changelogs);

    const rows = $derived(
        timestamp.map((ts, i) => ({
            timestamp: ts,
            total: sum[i],
        })),
    );


    const spec: TimelineChartSpec = $derived.by(() => ({
        rows,
        x: (d: any) => new Date(d.timestamp * 1000),
        series: makeSeries([
            { key: "total", color: seriesColors.total },
        ]),
        title: "Complete history",
        xFormat: "day",
        yDomain: [0, 50000],
        yTickFormat: formatInteger,
        itemFormat: formatInteger,
        annotations: [],
        hideZeros: false,
    }));

</script>

<div>
    <TimelineChart {spec} />

</div>
