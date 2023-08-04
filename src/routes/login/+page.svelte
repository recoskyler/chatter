<script lang="ts">
  import FormError from "components/FormError.svelte";
  import { superForm } from "sveltekit-superforms/client";
  import type { PageData } from "./$types";
  import { LightSwitch } from "@skeletonlabs/skeleton";
  import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  export let data: PageData;

  let passwordVisible = false;

  const { form, errors, constraints, enhance, delayed } = superForm(data.form);

  const handleInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $form.password = target.value;
  }
</script>

<svelte:head>
  <title>Chatter | Sign in</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto py-10 px-5 w-full max-w-sm">
  <h1 class="h2 text-center mb-5">Sign in</h1>

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

      <div class="input-group input-group-divider grid-cols-[1fr_auto] mb-5">
        <input
          id="password"
          name="password"
          class="input"
          type={passwordVisible ? "text" : "password"}
          placeholder="password"
          disabled={$delayed}
          value={$form.password}
          on:input={handleInput}
          {...$constraints.password}
        />

        <button
          on:click={(e) => {
            e.preventDefault();
            passwordVisible = !passwordVisible;
          }}
          class="flex items-center justify-center"
          type="button"
        >
          <Fa fw icon={passwordVisible ? faEye : faEyeSlash} />
        </button>
      </div>

      <br />
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
      data-umami-event="Sign-in button"
      data-umami-event-email={$form.email}
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
