<script lang="ts">
  import { enhance } from "$app/forms";
</script>

<svelte:head>
  <title>Chatter | Password reset</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Password reset</h1>

  <form method="POST" use:enhance>
    <label for="password" class="label mb-2">New password</label>

    <input
      id="password"
      name="password"
      type="password"
      class="input mb-5"
      title="Password"
      placeholder="password"
      min="8"
    /><br />

    <input
      type="submit"
      value="Reset password"
      class="btn variant-filled-primary mt-5 w-full"
    />
  </form>
</div>
