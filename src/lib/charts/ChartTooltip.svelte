<script lang="ts">
    import { Tooltip } from "layerchart/svg";

    let {
        context,
        mode = "series",
        header,
        formatValue,
        label,
    }: {
        context: any;
        mode?: "series" | "data";
        header?: (d: any) => string;
        formatValue?: (v: number) => string;
        label?: (d: any) => string;
    } = $props();
</script>

<Tooltip.Root {context} variant="none">
    {#snippet children(state: any)}
        {@const data = state.data}
        {@const series = state.series ?? []}
        <div class="lc-tt">
            {#if header}
                <div class="lc-tt-header">{header(data)}</div>
            {/if}
            {#if mode === "data"}
                <div class="lc-tt-row">
                    <span class="lc-tt-dot" style:background-color={data.color}></span>
                    <span class="lc-tt-label">{label ? label(data) : data.label}</span>
                    <span class="lc-tt-value">{formatValue ? formatValue(data.value) : data.value}</span>
                </div>
            {:else}
                {#each series as s}
                    <div class="lc-tt-row">
                        <span class="lc-tt-dot" style:background-color={s.color}></span>
                        <span class="lc-tt-label">{label ? label(s) : s.label}</span>
                        <span class="lc-tt-value">{formatValue ? formatValue(s.value) : s.value}</span>
                    </div>
                {/each}
            {/if}
        </div>
    {/snippet}
</Tooltip.Root>

<style>
    @layer components {
        .lc-tt {
            background: var(--chart-tooltip-bg);
            color: var(--chart-tooltip-text);
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 13px;
            min-width: 90px;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }
        .lc-tt-header {
            font-weight: 600;
            margin-bottom: 4px;
        }
        .lc-tt-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin: 2px 0;
        }
        .lc-tt-label {
            display: flex;
            align-items: center;
            gap: 6px;
            text-transform: capitalize;
        }
        .lc-tt-value {
            font-weight: 600;
        }
        .lc-tt-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
    }
</style>