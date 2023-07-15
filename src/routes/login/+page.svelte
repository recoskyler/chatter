<script lang="ts">
  import { enhance } from "$app/forms";
</script>

<svelte:head>
  <title>Chatter | Sign in</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Sign in</h1>

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

    <label for="password" class="label mb-2">Password</label>

    <input
      type="password"
      id="password"
      name="password"
      class="input mb-5"
      title="Password"
      placeholder="password"
      min="8"
    /><br />

    <p class="text-center">
      <span class="text-slate-400">Forgot your password? </span>
      <a class="anchor" href="/password-reset">Reset password</a>
    </p>

    <input
      type="submit"
      value="Continue"
      class="btn variant-filled-primary mt-5 w-full"
    />
  </form>

  <hr class="!border-t-2 my-5" />

  <p class="text-center">
    <span class="text-slate-400">Don't have an account? </span>
    <a class="anchor" href="/signup">Register now</a>
  </p>
</div>

<style lang="scss">
</style>
