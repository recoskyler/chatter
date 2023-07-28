<script lang="ts">
  import { fade } from "svelte/transition";

  export let error: string | string[] | undefined;
</script>

{#if error && error.length > 0}
  {#if typeof error === "string"}
    <p class="text-center text-red-400 my-3 break-words w-full max-w-xs" transition:fade>{error}</p>
  {:else}
    <div class="flex flex-col gap-3 items-center">
      {#each error as err}
        <p class="text-center text-red-400 my-3 break-words w-full max-w-xs" transition:fade>{err}</p>
      {/each}
    </div>
  {/if}
{/if}
