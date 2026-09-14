import type { ChartSeries } from "./types.js";

/**
 * Build a chart's `series` list from a set of thin, wide-row fields.
 *
 * Each def's `key` is the series identity — used by the legend, tooltip, and
 * (for bar charts) the grouped-bar sub-band, so it must match the wide-row
 * field name unless an explicit `field` is given. `label` defaults to `key`;
 * pass `field` when the key and row property differ (e.g. a series keyed
 * `"total"` reading the `sum` field).
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