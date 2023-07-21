<script lang="ts">
  import { enhance } from "$app/forms";
  import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH, MIN_EMAIL_LENGTH, MIN_PASSWORD_LENGTH } from "$lib/constants.js";
  import { isEmailValid } from "$lib/functions/validators.js";
  import FormError from "components/FormError.svelte";

  let email = "";
  let password = "";

  const isValid = (email: string, password: string) => isEmailValid(email) && password.length >= MIN_PASSWORD_LENGTH;

  export let form;
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
      minlength={MIN_EMAIL_LENGTH}
      maxlength={MAX_EMAIL_LENGTH}
      required
      bind:value={email}
    /><br />

    <label for="password" class="label mb-2">Password</label>

    <input
      type="password"
      id="password"
      name="password"
      class="input mb-5"
      title="Password"
      placeholder="password"
      minlength={MIN_PASSWORD_LENGTH}
      maxlength={MAX_PASSWORD_LENGTH}
      required
      bind:value={password}
    /><br />

    <FormError error={form?.error} />

    <p class="text-center">
      <span class="text-slate-400">Forgot your password? </span>
      <a class="anchor" href="/password-reset">Reset password</a>
    </p>

    <input
      type="submit"
      value="Continue"
      class={`btn mt-5 w-full ${isValid(email, password) ? "variant-filled-primary" : "variant-filled-surface"}`}
      disabled={!isValid(email, password)}
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
