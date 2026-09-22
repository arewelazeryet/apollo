import { getCompleteHistory, getCompleteHistoryWeekly } from "$lib/server/backend.server"
import type { PageServerLoad } from "../$types"

export const load: PageServerLoad = async ({ depends, fetch, setHeaders }) => {
    return { changelogs: await getCompleteHistory(fetch), weekly: await getCompleteHistoryWeekly(fetch) };
}
