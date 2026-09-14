<script lang="ts">
    let {
        items,
    }: { items: { label: string; color: string }[] } = $props();
</script>

<div class="chart-legend">
    {#each items as item}
        <span class="chart-legend-item">
            <span class="chart-legend-swatch" style:background-color={item.color}></span>
            <span class="chart-legend-label">{item.label}</span>
        </span>
    {/each}
</div>

<style>
    @layer components {
        .chart-legend {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            padding: 10px 0;
        }
        .chart-legend-item {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }
        .chart-legend-label {
            font-size: 14px;
            font-weight: 700;
            color: var(--chart-text);
        }
        .chart-legend-swatch {
            width: 20px;
            height: 12px;
            border-radius: 2px;
            display: inline-block;
        }
    }
</style>