<script lang="ts">
  import { enhance } from "$app/forms";
</script>

<svelte:head>
  <title>Chatter | Email verification</title>
</svelte:head>

<div class="container text-center mx-auto my-auto">
  <h1 class="h1">Email verification</h1>
  <br />
  <p>Please check your email for a verification link</p>
  <br />
  <form use:enhance method="post">
    <input type="submit" value="Sign out" class="btn variant-filled-primary" />
  </form>
</div>
