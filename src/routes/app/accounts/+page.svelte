<script lang="ts">
  import { pageTitle } from "writables/pageTitle";
  import type { PageData } from "./$types";

  export let data: PageData;

  $pageTitle = "Accounts";
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | Accounts</title>
</svelte:head>


