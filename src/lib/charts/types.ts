export type ChartSeries = {
    key: string;
    label: string;
    color: string;
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
    x: (d: any) => Date | string;
    series: ChartSeries[];
    title: string;
    xMode: "time" | "category";
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