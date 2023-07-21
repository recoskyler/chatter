<script lang="ts">
  import { enhance } from "$app/forms";
  import PasswordPopup from "components/PasswordPopup.svelte";
  import { type PopupSettings, popup } from "@skeletonlabs/skeleton";
  import {
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
  } from "$lib/constants.js";
  import FormError from "components/FormError.svelte";
  import { isPasswordValid } from "$lib/functions/validators.js";
  import PasswordStrengthMeter from "components/PasswordStrengthMeter.svelte";

  const popupFocusBlur: PopupSettings = {
    event: "focus-blur",
    target: "popupFocusBlur",
    placement: "top",
  };

  export const levels = ["Super weak", "Very weak", "Weak", "Strong", "Very strong"];
  export const colorLevels = [
    "text-red-600",
    "text-red-500",
    "text-orange-400",
    "text-green-300",
    "text-green-500",
  ];

  let password = "";

  export let form;
</script>

<svelte:head>
  <title>Chatter | Password reset</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Password reset</h1>

  <form method="POST" use:enhance>
    <label for="password" class="label mb-2">New password</label>

    <PasswordPopup password={password} />

    <input
      id="password"
      name="password"
      type="password"
      class="input mb-5"
      title="Password"
      placeholder="password"
      minlength={MIN_PASSWORD_LENGTH}
      maxlength={MAX_PASSWORD_LENGTH}
      required
      bind:value={password}
      use:popup={popupFocusBlur}
    /><br />

    <PasswordStrengthMeter password={password} />

    <FormError error={form?.error} />

    <input
      type="submit"
      value="Reset password"
      class={`btn mt-5 w-full ${isPasswordValid(password) ? "variant-filled-primary" : "variant-ghost-error"}`}
      disabled={!isPasswordValid(password)}
    />
  </form>
</div>
