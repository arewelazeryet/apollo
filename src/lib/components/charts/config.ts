import type { TransformContext, TransformState, TransformStateOptions } from "layerchart";
export const zoomConfig = {
    transform: {
        mode: "domain" as const,
        axis: "both" as const,
        scrollMode: "none" as const,
        pinch: true,
        scaleExtent: [1, 40] as [number, number],
        domainExtent: {
            x: { min: "data" as const, max: "data" as const },
            // Never let a zoom/pan reveal negative values (percentages or counts)
            y: { min: 0 as const, max: "data" as const },
        },
    }  as TransformStateOptions,
};

/// Numeric formatting shared by the tooltips of the count/score charts.
export function formatInteger(value: number): string {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/// Percent formatter for the ratio axis (0-100 -> 0%..100%).
export function formatPercent(value: number): string {
    return (Number(value) / 100).toLocaleString("en-US", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
