<script lang="ts">
  import { enhance } from "$app/forms";
  import { MAX_EMAIL_LENGTH, MIN_EMAIL_LENGTH } from "$lib/constants";
  import FormError from "components/FormError.svelte";
  import { isEmailValid } from "$lib/functions/validators.js";

  let email = "";

  export let form;
</script>

<svelte:head>
  <title>Chatter | Password reset</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Password reset</h1>

  {#if form?.success}
    <p class="text-center my-5 break-words max-w-xs text-slate-400">
      A password reset email has been sent if an account with that email exists.
    </p>

    <a href="/login" class="btn variant-filled-primary mt-5 w-full">Back to login</a>
  {:else}
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

      <FormError error={form?.error} />

      <input
        type="submit"
        value="Continue"
        class={`btn mt-5 w-full ${isEmailValid(email) ? "variant-filled-primary" : "variant-filled-surface"}`}
        disabled={!isEmailValid(email)}
      />
    </form>
  {/if}
</div>
