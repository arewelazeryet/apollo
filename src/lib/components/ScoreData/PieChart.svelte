<script lang="ts">
    import { ScorePieChart, seriesColors } from "$lib/charts";
    import type { PieChartSpec } from "$lib/charts/types";
    import type { Bucket } from "$lib/utils/types";

    let {
        values,
    }: {
        values: Bucket[];
    } = $props();

    const spec: PieChartSpec = $derived.by(() => {
        const totals = values.reduce(
            (acc, bucket) => {
                acc.lazer += bucket.lazer;
                acc.stable += bucket.stable;
                acc.both += bucket.both;
                return acc;
            },
            { lazer: 0, stable: 0, both: 0 },
        );

        return {
            items: [
                { key: "lazer", label: "lazer", value: totals.lazer, color: seriesColors.lazer },
                { key: "stable", label: "stable", value: totals.stable, color: seriesColors.stable },
                { key: "both", label: "both", value: totals.both, color: seriesColors.both },
            ],
            title: "User totals",
        };
    });
</script>

<div style="height: 500px; width: 80%; padding: 15px;">
    <ScorePieChart {spec} />
</div>