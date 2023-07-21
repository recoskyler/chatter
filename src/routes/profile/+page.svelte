<script lang="ts">
  import { enhance } from "$app/forms";
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<svelte:head>
  <meta name="robots" content="noindex">
  <title>Chatter | Profile</title>
</svelte:head>

<main class="container sm mx-auto my-auto p-5 text-center">
  <h1 class="h1">Profile</h1>

  <br />

  <div>
    <h2 class="h2">{data.user.name}</h2>
    <p>{data.user.email}</p>
  </div>

  <form use:enhance method="post">
    <input type="submit" value="Sign out" class="btn variant-filled-primary mt-5" />
  </form>
</main>
