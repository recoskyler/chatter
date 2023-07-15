<script lang="ts">
  import { enhance } from "$app/forms";
	import type { PageData } from "./$types";

	export let data: PageData;

  console.log(data.user);
</script>

<svelte:head>
  <title>Chatter | Profile</title>
</svelte:head>

<main>
  <h1>Profile</h1>

  <div>
    <p>User ID: {data.user.userId}</p>
    <p>Email: {data.user.email}</p>
  </div>

  <form use:enhance method="post">
    <input type="submit" value="Sign out" />
  </form>
</main>
