<script lang="ts">
  import PasswordPopup from "components/PasswordPopup.svelte";
  import { LightSwitch, popup } from "@skeletonlabs/skeleton";
  import FormError from "components/FormError.svelte";
  import { isPasswordValid } from "$lib/functions/validators.js";
  import PasswordStrengthMeter from "components/PasswordStrengthMeter/PasswordStrengthMeter.svelte";
  import { passwordPopupFocusBlur } from "components/PasswordStrengthMeter/helpers.js";
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
    <label for="password" class="label mb-5">New password</label>

    <PasswordPopup password={$form.password} />

    <input
      id="password"
      name="password"
      type="password"
      class="input mb-2"
      title="Password"
      placeholder="password"
      disabled={!(!$message) || $delayed}
      bind:value={$form.password}
      use:popup={passwordPopupFocusBlur}
      {...$constraints.password}
    /><br />

    <PasswordStrengthMeter password={$form.password} />

    {#if $errors.password}<FormError error={$errors.password} />{/if}

    {#if $message}<FormSuccess message={$message} />{/if}

    <input
      type="submit"
      value={$delayed ? "Resetting password..." : "Reset password"}
      class={`btn w-full ${
        isPasswordValid($form.password) && !$delayed && !$message
          ? "variant-filled"
          : "variant-filled-surface"
      }`}
      disabled={!isPasswordValid($form.password) || $delayed || $message}
    />
  </form>

  {#if $message}
    <a href="/login" class="btn variant-filled-primary w-full mt-5">
      Back to login
    </a>
  {/if}

  <div class="flex items-center justify-center w-full mt-5">
    <LightSwitch bgDark="bg-surface-400" />
  </div>
</div>
