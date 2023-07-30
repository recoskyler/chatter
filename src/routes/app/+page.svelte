<script lang="ts">
  import { pageTitle } from "$lib/stores/pageTitle";
  import type { PageData } from "./$types";

  export let data: PageData;

  $pageTitle = "Chatter";
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | Setup</title>
</svelte:head>

{#if data.user.chats.length === 0}
  <div class="h-full w-full flex flex-col items-center justify-center">
    <p class="text-center text-slate-400">You don't have any chats</p>

    <form action="" method="post"></form>
  </div>
{/if}
