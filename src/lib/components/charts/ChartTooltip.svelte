<script lang="ts">
    import { Tooltip } from "layerchart/svg";

    let {
        context,
        mode = "series",
        header,
        formatValue,
        series = [],
        extraValues = [],
        hideZeros = false,
    }: {
        context: any;
        mode?: "series" | "data";
        header?: (d: any) => string;
        formatValue?: (v: number) => string;
        series?: { key: string; label: string; color: string; value?: (d: any) => number }[];
        extraValues?: { label: string; value: (d: any) => number; format?: (v: number) => string }[];
        hideZeros?: boolean;
    } = $props();
</script>

{#snippet extras(row: any)}
    {#each extraValues as ev}
        <tr>
            <td></td>
            <td class="lc-tt-label lc-tt-sub">{ev.label}</td>
            <td class="lc-tt-value">{ev.format ? ev.format(ev.value(row)) : ev.value(row)}</td>
        </tr>
    {/each}
{/snippet}

<Tooltip.Root {context} variant="none">
    {#snippet children({ data })}
        <table class="lc-tt">
            {#if header}
                <thead><tr><td colspan="3" class="lc-tt-header">{header(data)}</td></tr></thead>
            {/if}
            <tbody>
                {#if mode === "data"}
                    <tr>
                        <td><span class="lc-tt-dot" style:background-color={data.color}></span></td>
                        <td class="lc-tt-label">{data.label}</td>
                        <td class="lc-tt-value">{formatValue ? formatValue(Number(data.value)) : data.value}</td>
                    </tr>
                    {@render extras(data)}
                {:else}
                    {#each series as s}
                        {@const raw = typeof s.value === "function" ? s.value(data) : data?.[s.key]}
                        {#if raw != null && (!hideZeros || Number(raw) !== 0)}
                            <tr>
                                <td><span class="lc-tt-dot" style:background-color={s.color}></span></td>
                                <td class="lc-tt-label">{s.label}</td>
                                <td class="lc-tt-value">{formatValue ? formatValue(Number(raw)) : raw}</td>
                            </tr>
                            {@render extras(data)}
                        {/if}
                    {/each}
                {/if}
            </tbody>
        </table>
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
            border-collapse: collapse;
            border-spacing: 0;
        }
        .lc-tt td {
            border: none;
            padding: 1px 4px;
            vertical-align: middle;
        }
        .lc-tt-header {
            font-weight: 600;
            padding-bottom: 4px;
        }
        .lc-tt-label {
            text-align: left;
            text-transform: capitalize;
            white-space: nowrap;
            padding-right: 12px;
        }
        .lc-tt-sub {
            padding-left: 14px;
            color: color-mix(in oklab, var(--chart-tooltip-text) 70%, transparent);
            text-transform: none;
        }
        .lc-tt-value {
            text-align: left;
            font-weight: 600;
            white-space: nowrap;
        }
        .lc-tt-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
    }
</style>
