<script lang="ts">
    import { GroupedBarChart, seriesColors, formatInteger } from "$lib/charts";
    import type { BarChartSpec } from "$lib/charts/types";
    import { maxLabelSize } from "$lib/utils/graph.ts";
    import {
        aggregateByClientType,
        getTimestamps,
        type AggregateFieldUnion,
        type AggregateResponse,
    } from "$lib/utils/types";

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

    const rows = $derived.by(() => {
        const timestamps = getTimestamps(filteredData);
        const lazerData = filteredData
            .filter((v) => v.client_type === "lazer")
            .map((v) => v[field_name]);
        const stableData = filteredData
            .filter((v) => v.client_type === "stable")
            .map((v) => v[field_name]);
        return timestamps.map((ts, i) => ({
            timestamp: ts,
            lazer: lazerData[i],
            stable: stableData[i],
        }));
    });

    const spec: BarChartSpec = $derived.by(() => ({
        rows,
        x: (d: any) => new Date(d.timestamp * 1000),
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
        ],
        title: humanized_field_name,
        xMode: "time",
        yMax: maxLabelSize(field_name),
        yTickFormat: formatInteger,
    }));
</script>

<div style="height: 480px; padding: 15px 10px; width: 80%;">
    <GroupedBarChart {spec} />
</div>