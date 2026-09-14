<script lang="ts">
    import { GroupedBarChart, makeSeries, seriesColors, formatInteger } from "$lib/components/charts";
    import type { BarChartSpec } from "$lib/components/charts/types";
    import { maxLabelSize } from "$lib/utils/graph.ts";
    import {
        aggregateByClientType,
        getTimestamps,
        type AggregateFieldUnion,
        type AggregateResponse,
    } from "$lib/utils/types";
    import ChartCard from "$lib/components/ChartCard.svelte";

    let {
        values,
        ruleset,
        humanized_field_name,
        field_name,
    }: {
        values: AggregateResponse[];
        ruleset: "osu" | "taiko" | "mania" | "catch" | "all";
        humanized_field_name: string;
        field_name: AggregateFieldUnion;
    } = $props();

    const filteredData = $derived(
        ruleset === "all" ? aggregateByClientType(values) : values.filter((v) => v.ruleset_id === ruleset),
    );

    // Rendering thousands of daily bars is slow to mount and unreadable at full
    // range, so keep at most ~150 evenly-spaced buckets.
    const MAX_BARS = 150;

    const rows = $derived.by(() => {
        const timestamps = getTimestamps(filteredData);
        const lazerData = filteredData
            .filter((v) => v.client_type === "lazer")
            .map((v) => v[field_name]);
        const stableData = filteredData
            .filter((v) => v.client_type === "stable")
            .map((v) => v[field_name]);
        const full = timestamps.map((ts, i) => ({
            timestamp: ts,
            lazer: lazerData[i],
            stable: stableData[i],
        }));
        const n = full.length;
        if (n <= MAX_BARS) return full;
        const step = Math.max(1, Math.ceil(n / MAX_BARS));
        const sampled = full.filter((_, i) => i % step === 0);
        if (sampled[sampled.length - 1] !== full[n - 1]) sampled.push(full[n - 1]);
        return sampled;
    });

    const spec: BarChartSpec = $derived.by(() => ({
        rows,
        x: (d: any) => new Date(d.timestamp * 1000).toISOString().slice(0, 10),
        series: makeSeries([
            { key: "lazer", color: seriesColors.lazer },
            { key: "stable", color: seriesColors.stable },
        ]),
        title: humanized_field_name,
        yMax: maxLabelSize(field_name),
        yTickFormat: formatInteger,
    }));
</script>

<ChartCard>
    <GroupedBarChart {spec} />
</ChartCard>
