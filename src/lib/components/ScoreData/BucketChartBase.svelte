<script lang="ts">
    import Segment from "$components/SegmentedControl/Segment.svelte";
    import SegmentedControl from "$components/SegmentedControl/SegmentedControl.svelte";
    import type { AggregateResponse, Bucket } from "$utils/types";
    import BucketChart from "./BucketChart.svelte";
    import PieChart from "./PieChart.svelte";

    type LoadProps = {
        aggregate: AggregateResponse[];
        daily: Bucket[];
        monthly: Bucket[];
        weekly: Bucket[];
        daily_scores: Bucket[];
        weekly_scores: Bucket[];
        monthly_scores: Bucket[];
    };

    let { values }: { values: LoadProps } = $props();

    let buckets: "daily" | "weekly" | "monthly" = $state("daily");
    let type: "scores" | "users" = $state("users");

    /// There has to be a better way...
    const selected_bucket: Bucket[] = $derived.by(() => {
        let key = buckets;
        if (type === "scores") {
            key = key + "_scores"
        }
        return values[key] as Bucket[]
    })
</script>

<div class="outer-box">
    <SegmentedControl value={type} onChange={(v) => (type = v)}>
        {#each ["users", "scores"] as option}
            <Segment value={option}>{option}</Segment>
        {/each}
    </SegmentedControl>
    <SegmentedControl value={buckets} onChange={(v) => (buckets = v)}>
        {#each ["daily", "weekly", "monthly"] as option}
            <Segment value={option}>{option}</Segment>
        {/each}
    </SegmentedControl>
    <BucketChart values={selected_bucket} />
    <PieChart values={selected_bucket} />
</div>

<style>
    .outer-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
</style>
