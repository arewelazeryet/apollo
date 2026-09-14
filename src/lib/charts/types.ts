export type ChartSeries = {
    /** Series identity: the row field name for bar charts (grouped-bar sub-band). */
    key: string;
    label: string;
    color: string;
    /**
     * Read the series' value from a row. For bar charts the chart keeps this
     * accessor only for the tooltip/axis max — the grouped-bar sub-band is
     * derived from `key` alone, so a wide row must store each series under its
     * own field (see `makeSeries`).
     */
    value: (d: any) => number;
};

export type MilestoneAnnotation = {
    date: string;
    label: string;
};

export type TimelineChartSpec = {
    rows: Record<string, number>[];
    x: (d: any) => Date;
    series: ChartSeries[];
    title: string;
    /** Controls x-axis tick density and tooltip header format */
    xFormat: "hour" | "month" | "day" | "auto";
    yDomain?: [number, number];
    yTicks?: number;
    yTickFormat?: (value: number) => string;
    itemFormat?: (value: number) => string;
    annotations?: MilestoneAnnotation[];
    height?: number;
};

export type BarChartSpec = {
    rows: Record<string, number | string>[];
    /** Date → time x-axis, string → category x-axis. */
    x: (d: any) => Date | string;
    series: ChartSeries[];
    title: string;
    yMax?: number;
    yTickFormat?: (value: number) => string;
    itemFormat?: (value: number) => string;
    height?: number;
};

export type PieChartSpec = {
    items: { key: string; label: string; value: number; color: string }[];
    title: string;
    height?: number;
};