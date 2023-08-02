<script lang="ts">
  import FormError from "components/FormError.svelte";
  import { superForm } from "sveltekit-superforms/client";
  import type { PageData } from "./$types";
  import { LightSwitch } from "@skeletonlabs/skeleton";

  export let data: PageData;

  const { form, errors, constraints, enhance, delayed } = superForm(data.form);
</script>

<svelte:head>
  <title>Chatter | Sign in</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Sign in</h1>

  <form method="POST" use:enhance>
    <label for="email" class="label mb-5">
      <span>Email</span>

      <input
        id="email"
        name="email"
        type="email"
        class="input mb-5"
        title="Email"
        placeholder="john@example.com"
        autocomplete="email"
        disabled={$delayed}
        bind:value={$form.email}
        {...$constraints.email}
      /><br />
    </label>

    {#if $errors.email}<FormError error={$errors.email} />{/if}

    <label for="password" class="label mb-5">
      <span>Password</span>

      <input
        type="password"
        id="password"
        name="password"
        class="input mb-5"
        title="Password"
        placeholder="password"
        disabled={$delayed}
        bind:value={$form.password}
        {...$constraints.password}
      /><br />
    </label>

    {#if $errors.password}<FormError error={$errors.password} />{/if}

    {#if $errors?._errors}<FormError error={$errors._errors} />{/if}

    <p class="text-center">
      <span class="text-slate-600 dark:text-slate-400">Forgot your password? </span>
      <a class="anchor" href="/password-reset">Reset password</a>
    </p>

    <input
      type="submit"
      value={$delayed ? "Logging in..." : "Continue"}
      class={`btn mt-5 w-full ${$delayed ? "variant-filled-surface" : "variant-filled"}`}
      disabled={$delayed}
    />
  </form>

  <hr class="!border-t-2 my-5" />

  <p class="text-center">
    <span class="text-slate-600 dark:text-slate-400">Don't have an account? </span>
    <a class="anchor" href="/signup">Register now</a>
  </p>

  <div class="flex items-center justify-center w-full mt-5">
    <LightSwitch bgDark="bg-surface-400" />
  </div>
</div>
