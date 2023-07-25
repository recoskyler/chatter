<script lang="ts">
  import type { PageData } from './$types';
  import { Stepper, Step } from '@skeletonlabs/skeleton';
  import { enhance } from "$app/forms";
  import FormError from 'components/FormError.svelte';

  export let data: PageData;
  export let form;

  export let name = "";
  export let key = "";
  export let model = data.chatModels[0].id;

  const onComplete = (e: Event) => {
    const submitButton = document.getElementById("submit-btn");

    if (!submitButton) return;

    submitButton.click();
  };
</script>

<Stepper class="container max-w-md my-auto mx-auto border-solid border-slate-700 border-2 p-5 rounded-lg" on:complete={onComplete}>
	<Step>
		<svelte:fragment slot="header">Welcome to Chatter!</svelte:fragment>
		Let's get started with your account setup.
	</Step>

	<Step>
		<svelte:fragment slot="header">What is Chatter?</svelte:fragment>
		Chatter is a free, open-source, and simple <a href="https://openai.com/chatgpt" class="anchor">OpenAI ChatGPT</a> client which uses <a href="https://openai.com/blog/introducing-chatgpt-and-whisper-apis" class="anchor">ChatGPT API</a>.
	</Step>

	<Step>
		<svelte:fragment slot="header">What are "Accounts"?</svelte:fragment>
    "Accounts" enable you to have separate <a href="https://openai.com/" class="anchor">OpenAI</a> accounts, which means their billing is kept separate too. This allows you to manage different chats with distinct billing requirements, ensuring clear separation and organization.
	</Step>

  <Step locked={key.trim() === "" && key.trim().length >= 2 && key.trim().length <= 255 && model !== ""}>
		<svelte:fragment slot="header">Create your first account</svelte:fragment>
    <ol class="list">
      <li>
        <span>1.</span>
        <span class="flex-auto">
          <a href="https://auth0.openai.com/u/signup/" class="anchor">Sign up</a> for the OpenAI Platform.
        </span>
      </li>

      <li>
        <span>2.</span>
        <span class="flex-auto">
          Create a new secret API key in <a href="https://platform.openai.com/account/api-keys" class="anchor">Settings ➔ API Keys</a>
        </span>
      </li>

      <li>
        <span>3.</span>
        <span class="flex-auto">
          Copy your secret key, and paste it below.
        </span>
      </li>
    </ol>

    <form action="POST">
      <label class="label mb-5 mt-5">
        <span>Secret API key</span>
        <input
          class="input"
          type="text"
          placeholder="YOUR SECRET API KEY"
          bind:value={key}
          maxlength={255}
          minlength={2}
          required
        />
      </label>

      <label class="label mb-5">
        <span>Model</span>

        <select class="select" bind:value={model}>
          {#each data.chatModels as model}
            <option value={model.id}>{model.displayName}</option>
          {/each}
        </select>
      </label>
    </form>
	</Step>

  <Step locked={name.trim() === "" && name.trim().length >= 2 && name.trim.length <= 255}>
		<svelte:fragment slot="header">Give a name to your account</svelte:fragment>
    Finally, give a cool name to your first account. Choose a name which describes best what this account will be used for.

    <form action="POST">
      <label class="label mb-5 mt-5">
        <span>Account name</span>
        <input
          class="input"
          type="text"
          placeholder="Cool name"
          bind:value={name}
          maxlength={255}
          minlength={2}
          required
        />
      </label>
    </form>
	</Step>
</Stepper>

<FormError error={form?.error} />

<form use:enhance method="post" id="submit-form" class="invisible">
  <input type="text" bind:value={name} name="name" required>
  <input type="text" bind:value={key} name="key" required>
  <input type="text" bind:value={model} name="model" required>
  <input type="submit" id="submit-btn">
</form>
