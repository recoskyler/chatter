<script lang="ts">
  import PasswordStrengthMeter from "../../lib/components/PasswordStrengthMeter/PasswordStrengthMeter.svelte";
  import { LightSwitch, popup } from "@skeletonlabs/skeleton";
  import PasswordPopup from "components/PasswordPopup.svelte";
  import FormError from "components/FormError.svelte";
  import { passwordPopupFocusBlur } from "components/PasswordStrengthMeter/helpers";
  import { superForm } from "sveltekit-superforms/client";
  import type { PageData } from "./$types";

  export let data: PageData;

  const { form, errors, constraints, enhance, delayed } = superForm(data.form);
</script>

<svelte:head>
  <title>Chatter | Create an account</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Create an account</h1>

  <form method="POST" use:enhance>
    <label for="name" class="label mb-2">
      <span>Name</span>

      <input
        id="name"
        name="name"
        type="text"
        class="input"
        title="Name"
        placeholder="John Doe"
        disabled={$delayed}
        bind:value={$form.name}
        {...$constraints.name}
      /><br />

      {#if $errors.name}<FormError error={$errors.name} />{/if}
    </label>


    <label for="email" class="label mb-2 mt-5">
      <span>Email</span>

      <input
        id="email"
        name="email"
        type="email"
        class="input"
        title="Email"
        placeholder="john@example.com"
        autocomplete="email"
        disabled={$delayed}
        bind:value={$form.email}
        {...$constraints.email}
      /><br />

      {#if $errors.email}<FormError error={$errors.email} />{/if}
    </label>

    <label for="password" class="label mb-2 mt-5">
      <span>Password</span>

      <PasswordPopup password={$form.password} />

      <input
        type="password"
        id="password"
        name="password"
        class="input mb-3"
        title="Password"
        placeholder="password"
        disabled={$delayed}
        bind:value={$form.password}
        use:popup={passwordPopupFocusBlur}
        {...$constraints.password}
      /><br />

      {#if $errors.password}<FormError error={$errors.password} />{/if}
    </label>

    <PasswordStrengthMeter password={$form.password} />

    <p class="text-center text-slate-600 dark:text-slate-400">
      <span>By continuing you agree to Chatter's </span>
      <br />
      <a class="anchor" href="/disclaimer">disclaimer</a>
      <span>, </span>
      <a class="anchor" href="/cookie">cookie policy</a>
      <span>, and </span>
      <a class="anchor" href="/privacy">privacy policy</a>
    </p>

    <input
      type="submit"
      value={$delayed ? "Signing up..." : "Continue"}
      class={`btn mt-5 w-full ${$delayed ? "variant-filled-surface" : "variant-filled"}`}
      disabled={$delayed}
      data-umami-event="Sign-up button"
      data-umami-event-email={$form.email}
      data-umami-event-name={$form.name}
    />
  </form>

  <hr class="!border-t-2 my-5" />

  <p class="text-center">
    <span class="text-slate-600 dark:text-slate-400">Already have an account? </span>
    <a class="anchor" href="/login">Sign in now</a>
  </p>

  <div class="flex items-center justify-center w-full mt-5">
    <LightSwitch bgDark="bg-surface-400" />
  </div>
</div>
