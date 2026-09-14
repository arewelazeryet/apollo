import type { AggregateFieldUnion } from "./types";

export const milestones = [
    { date: "2024-01-29", label: "pp release" },
    { date: "2024-07-24", label: "daily challenges" },
    { date: "2024-10-09", label: "combo scaling removal" },
    { date: "2025-06-04", label: "song select v2" },
    { date: "2025-11-20", label: "updated download page" },
    { date: "2026-04-17", label: "ranked play" },
    { date: "2026-06-20", label: "mod multiplier changes" },
];

export function maxLabelSize(field: AggregateFieldUnion) {
    switch (field) {
        case "unique_user_count":
            return undefined;
        case "unique_beatmap_count":
            return undefined;
        case "total_daily_scores":
            return 1000000;
        case "daily_scores_with_replays":
            return undefined;
        case "daily_perfect_combos":
            return undefined;
        case "daily_min_pp":
            return 1;
        case "daily_max_pp":
            return 2500;
        case "daily_sum_pp":
            return undefined;
        case "daily_sum_total_score":
            return undefined;
        case "daily_sum_classic_total_score":
            return undefined;
        case "daily_max_classic_total_score":
            return undefined;
        case "daily_average_accuracy":
            return undefined;
        case "daily_peak_combo":
            return 25000;
    }
}

export type { AggregateResponse, AggregateFieldUnion, Bucket } from "./types";