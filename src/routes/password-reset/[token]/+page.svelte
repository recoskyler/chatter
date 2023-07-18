<script lang="ts">
  import { enhance } from "$app/forms";
  import PasswordPopup from "components/PasswordPopup.svelte";
  import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
  import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
  import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
  import { type PopupSettings, popup } from "@skeletonlabs/skeleton";
  import {
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
  } from "$lib/constants.js";
  import FormError from "components/FormError.svelte";

  const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  };

  const popupFocusBlur: PopupSettings = {
    event: 'focus-blur',
    target: 'popupFocusBlur',
    placement: 'top',
  };

  zxcvbnOptions.setOptions(options);

  export const levels = ["Super weak", "Very weak", "Weak", "Strong", "Very strong"];
  export const colorLevels = ["text-red-600", "text-red-500", "text-orange-400", "text-green-300", "text-green-500"];

  let password = "";

  const isValid = (password: string, score: number) => (score >= 3 && password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH);

  $: score = zxcvbn(password).score;

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

    <FormError error={form?.error} />

    <input
      type="submit"
      value="Reset password"
      class="btn variant-filled-primary mt-5 w-full"
    />
  </form>
</div>
