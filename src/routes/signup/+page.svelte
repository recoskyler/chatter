<script lang="ts">
  import PasswordStrengthMeter from "../../lib/components/PasswordStrengthMeter/PasswordStrengthMeter.svelte";
  import { enhance } from "$app/forms";
  import { popup } from "@skeletonlabs/skeleton";
  import { fade } from "svelte/transition";
  import {
    MAX_EMAIL_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PASSWORD_LENGTH,
    MIN_EMAIL_LENGTH,
    MIN_NAME_LENGTH,
    MIN_PASSWORD_LENGTH,
  } from "$lib/constants.js";
  import PasswordPopup from "components/PasswordPopup.svelte";
  import { isValid } from "$lib/functions/validators.js";
  import FormError from "components/FormError.svelte";
  import { passwordPopupFocusBlur } from "components/PasswordStrengthMeter/helpers";

  let email = "";
  let name = "";
  let password = "";

  export let form;
</script>

<svelte:head>
  <title>Chatter | Create an account</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto">
  <h1 class="h2 text-center mb-5 p-5">Create an account</h1>

  <form method="POST" use:enhance>
    <label for="name" class="label mb-2">Name</label>

    <input
      id="name"
      name="name"
      type="text"
      class="input"
      title="Name"
      placeholder="John Doe"
      minlength={MIN_NAME_LENGTH}
      maxlength={MAX_NAME_LENGTH}
      required
      bind:value={name}
    /><br />

    {#if name.trim() !== "" && (name.trim().length < MIN_NAME_LENGTH || name.trim().length > MAX_NAME_LENGTH)}
      <p class="text-red-400 mt-2 break-words max-w-xs" transition:fade>
        Name must be between 2-255 characters long
      </p>
    {/if}

    <label for="email" class="label mb-2 mt-5">Email</label>

    <input
      id="email"
      name="email"
      type="email"
      class="input"
      title="Email"
      placeholder="john@example.com"
      autocomplete="email"
      minlength={MIN_EMAIL_LENGTH}
      maxlength={MAX_EMAIL_LENGTH}
      required
      bind:value={email}
    /><br />

    {#if email.trim() !== "" && (email.trim().length < MIN_EMAIL_LENGTH || email.trim().length > MAX_EMAIL_LENGTH)}
      <p class="text-red-400 mt-2 break-words max-w-xs" transition:fade>
        Email must be valid and between 5-255 characters long
      </p>
    {/if}

    <label for="password" class="label mb-2 mt-5">Password</label>

    <PasswordPopup {password} />

    <input
      type="password"
      id="password"
      name="password"
      class="input"
      title="Password"
      placeholder="password"
      minlength={MIN_PASSWORD_LENGTH}
      maxlength={MAX_PASSWORD_LENGTH}
      required
      bind:value={password}
      use:popup={passwordPopupFocusBlur}
    /><br />

    <PasswordStrengthMeter {password} />

    <FormError error={form?.error} />

    <p class="text-center text-slate-400">
      <span>By continuing you agree to</span>
      <br />
      <a class="anchor" href="/terms-and-conditions">terms and conditions</a>
      <span> and </span>
      <a class="anchor" href="/privacy-policy">privacy policy</a>
    </p>

    <input
      type="submit"
      value="Continue"
      class={`btn mt-5 w-full ${
        isValid(name, email, password)
          ? "variant-filled-primary"
          : "variant-ghost-error"
      }`}
      disabled={!isValid(name, email, password)}
    />
  </form>

  <hr class="!border-t-2 my-5" />

  <p class="text-center">
    <span class="text-slate-400">Already have an account? </span>
    <a class="anchor" href="/login">Sign in now</a>
  </p>
</div>
