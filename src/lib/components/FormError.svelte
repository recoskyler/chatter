<script lang="ts">
  import { fade } from "svelte/transition";

  export let error: string | undefined;
</script>

{#if error && error.length > 0}
  <p class="text-center text-red-400 my-5 break-words max-w-xs" transition:fade>{error}</p>
{/if}
