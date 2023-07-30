<script lang="ts">
  import { fade } from "svelte/transition";

  export let message: string | string[] | undefined;
</script>

{#if message && message.length > 0}
  {#if typeof message === "string"}
    <p class="text-center text-green-400 my-3 break-words w-full max-w-xs mx-auto" transition:fade>{message}</p>
  {:else}
    <div class="flex flex-col gap-3 items-center">
      {#each message as msg}
        <p class="text-center text-green-400 my-3 break-words w-full max-w-xs mx-auto" transition:fade>{msg}</p>
      {/each}
    </div>
  {/if}
{/if}
