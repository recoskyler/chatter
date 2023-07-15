<script lang="ts">
  import { enhance } from "$app/forms";
</script>

<svelte:head>
  <title>Chatter | Password reset</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Password reset</h1>

  <form method="POST" use:enhance>
    <label for="email" class="label mb-2">Email</label>

    <input
      id="email"
      name="email"
      type="email"
      class="input mb-5"
      title="Email"
      placeholder="john@example.com"
      autocomplete="email"
      min="5"
    /><br />

    <input
      type="submit"
      value="Continue"
      class="btn variant-filled-primary mt-5 w-full"
    />
  </form>
</div>
