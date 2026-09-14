import type { ChartSeries } from "./types.js";

/**
 * Each def's `key` is the series identity, so it must match the wide-row
 * field name unless an explicit `field` is given. `label` defaults to `key`
 */
export function makeSeries(
    defs: { key: string; label?: string; color: string; field?: string }[],
): ChartSeries[] {
    return defs.map((d) => ({
        key: d.key,
        label: d.label ?? d.key,
        color: d.color,
        value: (row: any) => row[d.field ?? d.key],
    }));
}
