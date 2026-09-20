import {
    getAggregates,
    getDaily,
    getDailyScores,
    getMonthly,
    getMonthlyScores,
    getWeekly,
    getWeeklyScores,
} from "$lib/server/athena.server";
import type { AggregateResponse, Bucket } from "$utils/types";
import type { PageServerLoad } from "./$types";

export type LoadProps = {
    aggregate: AggregateResponse[],
    daily:Bucket[],
    monthly:Bucket[],
    weekly:Bucket[],
    daily_scores: Bucket[],
    weekly_scores: Bucket[],
    monthly_scores: Bucket[],

}

export const load: PageServerLoad = async ({ depends, fetch, setHeaders }) => {
    const [aggregates, daily, weekly, monthly, daily_scores, weekly_scores, monthly_scores] = await Promise.all([
        getAggregates(fetch),
        getDaily(fetch),
        getWeekly(fetch),
        getMonthly(fetch),
        getDailyScores(fetch),
        getWeeklyScores(fetch),
        getMonthlyScores(fetch),
    ]);
    return {
        aggregate: aggregates,
        daily: daily,
        weekly: weekly,
        monthly: monthly,
        daily_scores: daily_scores,
        weekly_scores: weekly_scores,
        monthly_scores: monthly_scores
    };
};
