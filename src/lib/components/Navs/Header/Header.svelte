<script lang="ts">
    import FooterLink from "../Footer/FooterLink.svelte";
    import { env } from "$env/dynamic/public";
</script>

<nav class="header">
    <FooterLink url="/" title="users"
    ></FooterLink>
    <FooterLink url="/scores" title="scores"
    ></FooterLink>
</nav>

<style>
    .header {
        display: flex;
        width: 50%;
        transform: translateX(50%);
        flex-direction: row;
        justify-content: space-around;
    }
</style>
