<script lang="ts">
    import { GroupedBarChart, seriesColors, formatInteger } from "$lib/charts";
    import type { BarChartSpec } from "$lib/charts/types";
    import type { Bucket } from "$lib/utils/types";

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
        series: [
            {
                key: "lazer",
                label: "lazer",
                color: seriesColors.lazer,
                value: (d: any) => d.lazer,
            },
            {
                key: "stable",
                label: "stable",
                color: seriesColors.stable,
                value: (d: any) => d.stable,
            },
            {
                key: "both",
                label: "both",
                color: seriesColors.both,
                value: (d: any) => d.both,
            },
        ],
        title: "User distribution per user ID bucket",
        xMode: "category",
        yTickFormat: formatInteger,
    }));
</script>

<div style="height: 500px; width: 80%; padding: 15px;">
    <GroupedBarChart {spec} />
</div>