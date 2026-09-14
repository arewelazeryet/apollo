<script lang="ts">
    import Legend from "./Legend.svelte";

    let {
        title,
        height = 480,
        legend,
        children,
    }: {
        title: string;
        height?: number;
        legend?: { label: string; color: string }[];
        children: import("svelte").Snippet;
    } = $props();
</script>

<div class="chart-frame" style:height="{height}px">
    <h3 class="chart-title">{title}</h3>
    <div class="chart-body">
        {@render children()}
    </div>
    {#if legend}
        <Legend items={legend} />
    {/if}
</div>

<style>
    @layer components {
        .chart-frame {
            display: flex;
            flex-direction: column;
        }
        .chart-title {
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            margin: 0 0 4px 0;
            color: var(--chart-text);
            align-self: center;
        }
        .chart-body {
            flex: 1;
            min-height: 0;
            position: relative;
            padding: 10px;
        }
    }
</style>