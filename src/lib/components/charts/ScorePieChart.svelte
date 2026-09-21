<script lang="ts">
    import { PieChart } from "layerchart/svg";

    import ChartFrame from "./ChartFrame.svelte";
    import ChartTooltip from "./ChartTooltip.svelte";
    import { formatInteger } from "./config.js";
    import type { PieChartSpec } from "./types.js";

    let { spec }: { spec: PieChartSpec } = $props();

    const total = $derived(spec.items.reduce((acc, i) => acc + i.value, 0));
</script>

<ChartFrame
    title={spec.title}
    height={spec.height ?? 480}
    legend={spec.items.map((i) => ({ label: i.label, color: i.color }))}
>
    <PieChart
        data={spec.items}
        key="key"
        label="label"
        value="value"
        cRange={spec.items.map((i) => i.color)}
    >
        {#snippet tooltip({ context })}
            <ChartTooltip
                {context}
                mode="data"
                header={() => "User totals"}
                formatValue={formatInteger}
                extraValues={[
                    {
                        label: "share",
                        value: (item) => (total ? (item.value / total) * 100 : 0),
                        format: (v) => `${v.toFixed(1)}%`,
                    },
                ]}
            />
        {/snippet}
    </PieChart>
</ChartFrame>