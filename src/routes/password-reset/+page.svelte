<script lang="ts">
  import { MAX_EMAIL_LENGTH, MIN_EMAIL_LENGTH } from "$lib/constants";
  import FormError from "components/FormError.svelte";
  import { isEmailValid } from "$lib/functions/validators.js";
  import type { PageData } from "./$types";
  import { superForm } from "sveltekit-superforms/client";
  import FormSuccess from "components/FormSuccess.svelte";

  export let data: PageData;

  const { form, delayed, enhance, message, errors, constraints } = superForm(
    data.form
  );
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
      disabled={!(!$message) || $delayed}
      bind:value={$form.email}
      {...$constraints.email}
    /><br />

    {#if $errors.email}<FormError error={$errors.email} />{/if}

    {#if $message}<FormSuccess message={$message} />{/if}

    <input
      type="submit"
      value={$delayed ? "Loading..." : "Continue"}
      class={`btn mt-5 w-full ${
        isEmailValid($form.email) && !$delayed && !$message
          ? "variant-filled"
          : "variant-filled-surface"
      }`}
      disabled={!isEmailValid($form.email) || $delayed || $message}
    />
  </form>

  {#if $message}
    <a href="/login" class="btn variant-filled-primary w-full mt-5">
      Back to login
    </a>
  {/if}
</div>
