<script lang="ts">
    import { GroupedBarChart, makeSeries, seriesColors, formatInteger } from "$lib/components/charts";
    import type { BarChartSpec } from "$lib/components/charts/types";
    import type { Bucket } from "$lib/utils/types";
    import ChartCard from "$lib/components/ChartCard.svelte";

    let {
        values,
    }: {
        values: Bucket[];
    } = $props();

    const rows = $derived(
        values.map((v) => ({
            bucket: v.bucket,
            lazer: v.lazer,
            stable: v.stable,
            both: v.both,
        })),
    );

    const spec: BarChartSpec = $derived.by(() => ({
        rows,
        x: (d: any) => d.bucket,
        series: makeSeries([
            { key: "lazer", color: seriesColors.lazer },
            { key: "stable", color: seriesColors.stable },
            { key: "both", color: seriesColors.both },
        ]),
        title: "User distribution per user ID bucket",
        yTickFormat: formatInteger,
    }));
</script>

<ChartCard height={500}>
    <GroupedBarChart {spec} />
</ChartCard>
