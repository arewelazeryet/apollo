<script lang="ts">
    import { formatInteger, makeSeries, seriesColors, type MilestoneAnnotation, type TimelineChartSpec } from "$components/charts";
    import TimelineChart from "$components/charts/TimelineChart.svelte";
    import Segment from "$components/SegmentedControl/Segment.svelte";
    import SegmentedControl from "$components/SegmentedControl/SegmentedControl.svelte";
    import type { PointLineResponse } from "$lib/server/backend.server";


    let { data }: { data: { changelogs: PointLineResponse, weekly: PointLineResponse }} = $props();

    const daily = $derived(data.changelogs);
    const weekly = $derived(data.weekly);

    const rows = $derived(
        daily.timestamp.map((ts, i) => ({
            timestamp: ts,
            total: daily.sum[i],
        })),
    );

    const weeklyRows = $derived(
        weekly.timestamp.map((ts, i) => ({
            timestamp: ts,
            total: weekly.sum[i],
        })),
    );

    let state: "daily" | "weekly" = $state("daily");

    const spec: TimelineChartSpec = $derived.by(() => ({
        rows: state === "daily" ? rows : weeklyRows,
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

<div style="padding: 20px;">
    <div style="width: 100%">
        <div style="margin: 20px auto; width: min-content;">
            <SegmentedControl value={state} onChange={(v) => (state = v)}>
                {#each ["daily", "weekly"] as option}
                    <Segment value={option}>{option}</Segment>
                {/each}
            </SegmentedControl>

        </div>

    </div>
    <TimelineChart {spec} />

</div>
