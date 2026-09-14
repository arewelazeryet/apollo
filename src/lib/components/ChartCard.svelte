<script lang="ts">
    let {
        height = 480,
        centered = false,
        children,
    }: {
        /** Chart height in px; the chart fills it. */
        height?: number;
        /** Constrain to a centered ~700px column instead of 80% width. */
        centered?: boolean;
        children: import("svelte").Snippet;
    } = $props();
</script>

<div class="chart-card" class:centered style:height="{height}px">
    {@render children()}
</div>

<style>
    @layer components {
        .chart-card {
            width: 80%;
            padding: 15px 10px;
        }
        .chart-card.centered {
            width: 100%;
            max-width: 700px;
        }
    }
</style>