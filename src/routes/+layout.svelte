<script lang="ts">
    import Footer from '$components/Navs/Footer/Footer.svelte';
    import Header from '$components/Navs/Header/Header.svelte';
    import { page } from '$app/state';

    let { children } = $props();
</script>

<Header />
{#if ["arewelazeryet.chiffa.lol", "stabledeath.chiffa.lol", "localhost"].find((p) => p == page.url.hostname) !== undefined}
    <div class="spooky-banner">
        <h1>The .lol domain is being deprecated, please use <a href="https://arewelazeryet.chiffa.moe">arewelazeryet.chiffa.moe</a></h1>
    </div>
{/if}

{@render children()}
<Footer />

<style>
    .spooky-banner {
        font-size: 2rem;
        background-color: #eb6f92;

        & a {
            color: #31748f;
        }

        & h1 {
            color: #1f1d2e;
        }
    }
    @media (prefers-color-scheme: light) {
        :root {
            background-color: #f6f6f6;
            color: black;
        }
    }
    @media (prefers-color-scheme: dark) {
        :root {
            background-color: #191724;
            color: #e0def4;
        }
    }
</style>
