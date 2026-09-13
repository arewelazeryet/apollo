/// Palette reference. All values are CSS variables defined in `src/app.css`,
/// so charts re-theme on `prefers-color-scheme` changes without a rebuild.
export const palette = {
    text: "var(--chart-text)",
    grid: "var(--chart-grid)",
    border: "var(--chart-border)",
    lazer: "var(--chart-lazer)",
    stable: "var(--chart-stable)",
    total: "var(--chart-total)",
    both: "var(--chart-both)",
    milestone: "var(--chart-milestone)",
    tooltipBg: "var(--chart-tooltip-bg)",
    tooltipText: "var(--chart-tooltip-text)",
} as const;

export const seriesColors = {
    lazer: palette.lazer,
    stable: palette.stable,
    total: palette.total,
    both: palette.both,
} as const;

export function readCssVar(name: string): string | undefined {
    if (typeof window === "undefined") return undefined;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}