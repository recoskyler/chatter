<script lang="ts">
  import type { PageData } from "./$types";
  import { Stepper, Step, LightSwitch } from "@skeletonlabs/skeleton";
  import { superForm } from "sveltekit-superforms/client";

  export let data: PageData;

  const { form, errors, constraints, enhance } = superForm(data.form);

  const onComplete = (e: Event) => {
    const submitButton = document.getElementById("submit-btn");

    if (!submitButton) return;

    submitButton.click();
  };
</script>

<div class="flex flex-col justify-center items-center w-full h-screen overflow-y-auto">
  <Stepper
    class="container max-w-md border-solid border-slate-700 border-2 p-5 rounded-lg"
    on:complete={onComplete}
  >
    <Step>
      <svelte:fragment slot="header">Welcome to Chatter!</svelte:fragment>
      Let's get started with your account setup.
    </Step>

    <Step>
      <svelte:fragment slot="header">What is Chatter?</svelte:fragment>
      Chatter is a free, open-source, and simple
      <a href="https://openai.com/chatgpt" class="anchor">OpenAI ChatGPT</a>
      client which uses
      <a
        href="https://openai.com/blog/introducing-chatgpt-and-whisper-apis"
        class="anchor">ChatGPT API</a
      >.
    </Step>

    <Step>
      <svelte:fragment slot="header">What are "Accounts"?</svelte:fragment>
      "Accounts" enable you to have separate
      <a href="https://openai.com/" class="anchor">OpenAI</a> accounts, which means
      their billing is kept separate too. This allows you to manage different chats
      with distinct billing requirements, ensuring clear separation and organization.
    </Step>

    <Step
      locked={$form.key.trim() === "" ||
        $form.key.trim().length < 2 ||
        $form.key.trim().length > 255 ||
        $form.chatModelId === ""}
    >
      <svelte:fragment slot="header">Create your first account</svelte:fragment>
      <ol class="list">
        <li>
          <span>1.</span>
          <span class="flex-auto">
            <a href="https://auth0.openai.com/u/signup/" class="anchor">Sign up</a
            > for the OpenAI Platform.
          </span>
        </li>

        <li>
          <span>2.</span>
          <span class="flex-auto">
            Create a new secret API key in <a
              href="https://platform.openai.com/account/api-keys"
              class="anchor">Settings ➔ API Keys</a
            >
          </span>
        </li>

        <li>
          <span>3.</span>
          <span class="flex-auto">
            Copy your secret key, and paste it below.
          </span>
        </li>
      </ol>

      <label class="label mb-5 mt-5">
        <span>Secret API key</span>
        <input
          class="input"
          type="text"
          placeholder="YOUR SECRET API KEY"
          aria-invalid={$errors.key ? 'true' : undefined}
          bind:value={$form.key}
          {...$constraints.key}
        />
        {#if $errors.key}<span class="invalid">{$errors.key}</span>{/if}
      </label>

      <label class="label mb-5">
        <span>Model</span>

        <select class="select" bind:value={$form.chatModelId}>
          {#each data.chatModels as model}
            <option value={model.id}>{model.displayName}</option>
          {/each}
        </select>
      </label>
    </Step>

    <Step
      locked={$form.name.trim() === "" ||
        $form.name.trim().length < 2 ||
        $form.name.trim().length > 255}
    >
      <svelte:fragment slot="header">Give a name to your account</svelte:fragment>
      Finally, give a cool name to your first account. Choose a name which describes
      best what this account will be used for.

      <label class="label mb-5 mt-5">
        <span>Account name</span>
        <input
          class="input"
          type="text"
          placeholder="Cool name"
          aria-invalid={$errors.name ? 'true' : undefined}
          bind:value={$form.name}
          {...$constraints.name}
        />
        {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}
      </label>
    </Step>
  </Stepper>

  <div class="flex items-center justify-center w-full mt-5">
    <LightSwitch bgDark="bg-surface-400" />
  </div>
</div>

<form use:enhance method="post" id="submit-form" class="invisible">
  <input type="hidden" bind:value={$form.name} name="name" required />
  <input type="hidden" bind:value={$form.key} name="key" required />
  <input type="hidden" bind:value={$form.chatModelId} name="chatModelId" required />
  <input
    type="submit"
    id="submit-btn"
    data-umami-event="Complete setup button"
  />
</form>
