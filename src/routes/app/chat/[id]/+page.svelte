<script lang="ts">
  import { selectedChat } from "writables/selectedChat";

</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | {$selectedChat?.name}</title>
</svelte:head>
