<script lang="ts">
    let { row, date, column, children } = $props();
    const displayDate = $derived(date ? new Date(date).toLocaleDateString("en-GB") : "TBD");
    const succeeded = $derived(Boolean(date));
</script>

<div
    class="card {succeeded ? 'reached' : 'waiting'} {column === 'left'
        ? 'left'
        : 'right'}"
    style="grid-row: {row}"
>
    <h4 class="date">{displayDate}</h4>
    <h2>{@render children()}</h2>
</div>

<style>
    .card {
        border: 3px solid;
        border-radius: 20px;
        padding: 5px;
        overflow: hidden;
        max-width: 350px;
    }
    .date {
        color: light-dark(#908caa, black);
    }
    .left {
        grid-column: 1;
    }
    .right {
        grid-column: 2;
    }

    .reached {
        border-color: #88b300;
    }
    .waiting {
        border-color: #ed1221;
    }
    h2,
    h4 {
        margin: 5px;
    }
</style>
