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
  import Fa from "svelte-fa";
  import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

  export let data: PageData;

  let passwordVisible = false;

  const { form, delayed, enhance, message, errors, constraints } = superForm(
    data.form,
  );

  const handleInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $form.password = target.value;
  }
</script>

<svelte:head>
  <title>Chatter | Reset password</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Reset password</h1>

  <form method="POST" use:enhance>
    <label for="password" class="label mb-5">New password</label>

    <PasswordPopup password={$form.password} />

    <div class="input-group input-group-divider grid-cols-[1fr_auto] mb-2">
      <input
        name="password"
        class="input"
        type={passwordVisible ? "text" : "password"}
        placeholder="current password"
        disabled={!(!$message) || $delayed}
        value={$form.password}
        use:popup={passwordPopupFocusBlur}
        on:input={handleInput}
        {...$constraints.password}
      />

      <button
        on:click={(e) => {
          e.preventDefault();
          passwordVisible = !passwordVisible;
        }}
        class="flex items-center justify-center"
      >
        <Fa fw icon={passwordVisible ? faEye : faEyeSlash} />
      </button>
    </div>

    <br />

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
      data-umami-event="Password reset button"
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
