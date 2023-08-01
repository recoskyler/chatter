<script lang="ts">
  import { superForm } from "sveltekit-superforms/client";
  import type { PageData } from "./$types";
  import FormError from "components/FormError.svelte";
  import FormSuccess from "components/FormSuccess.svelte";
  import { writable } from "svelte/store";
  import { canGoBack } from "$lib/stores/canGoBack";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";

  $currentPage = CHATTER_PAGE.CHATS;
  $canGoBack = "/app";

  export let data: PageData;

  const changed = writable(false);

  const {
    form,
    enhance,
    message,
    delayed,
    errors,
    constraints,
  } = superForm(data.form, {onUpdated: () => {$changed = false;}});
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | Create chat</title>
</svelte:head>

<div class="flex h-screen mx-auto my-auto max-w-sm items-center flex-col justify-center">
  <form use:enhance method="post" class="w-full">
    <label class="label mb-5">
      <span>Chat name</span>

      <input
        name="name"
        class="input"
        type="text"
        placeholder="Cool chat name"
        disabled={$delayed}
        bind:value={$form.name}
        {...$constraints.name}
      />

      {#if $errors.name}
        <FormError error={$errors.name} />
      {/if}
    </label>

    <label class="label mb-5">
      <span>System prompt</span>

      <input
        name="prompt"
        class="input"
        type="text"
        placeholder="You are a helpful assistant"
        disabled={$delayed}
        bind:value={$form.prompt}
        {...$constraints.prompt}
      />

      {#if $errors.prompt}
        <FormError error={$errors.prompt} />
      {/if}
    </label>

    {#if $errors._errors}
      <FormError error={$errors._errors} />
    {/if}

    {#if $message}
      <FormSuccess message={$message} />
    {/if}

    <input
      type="submit"
      value={$delayed ? "Creating chat..." : "Create chat"}
      class={`btn mt-5 w-full ${$delayed ? "variant-filled-surface" : "variant-filled"}`}
      disabled={$delayed}
    />
  </form>
</div>
