<script lang="ts">
  import { superForm } from "sveltekit-superforms/client";
  import type { PageData } from "./$types";
  import FormError from "components/FormError.svelte";
  import FormSuccess from "components/FormSuccess.svelte";
  import { writable } from "svelte/store";
  import { canGoBack } from "$lib/stores/canGoBack";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";

  $currentPage = CHATTER_PAGE.ACCOUNTS;
  $canGoBack = "/app/accounts";

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
  <title>Chatter | Account | {data.account.name}</title>
</svelte:head>

<div class="flex h-screen mx-auto my-auto max-w-sm items-center flex-col justify-center">
  <form use:enhance method="post" action="?/save" class="w-full">
    <label class="label mb-5">
      <span>Account name</span>

      <input
        name="name"
        class="input"
        type="text"
        placeholder="John Doe"
        disabled={$delayed || data.account.deleted}
        on:change={(_) => {$changed = true;}}
        bind:value={$form.name}
        {...$constraints.name}
      />

      {#if $errors.name}
        <FormError error={$errors.name} />
      {/if}
    </label>

    <label class="label mb-5">
      <span>Secret API key</span>

      <input
        name="key"
        class="input"
        type="password"
        placeholder="SECRET API KEY"
        disabled={$delayed || data.account.deleted}
        on:change={(_) => {$changed = true;}}
        bind:value={$form.key}
        {...$constraints.key}
      />

      {#if $errors.key}
        <FormError error={$errors.key} />
      {/if}
    </label>

    <label class="label mb-5">
      <span>Model</span>

      <select
        class="select"
        name="chatModelId"
        disabled={$delayed || data.account.deleted}
        on:change={(_) => {$changed = true;}}
        bind:value={$form.chatModelId}
      >
        {#each data.chatModels as model}
          <option value={model.id}>{model.displayName}</option>
        {/each}
      </select>

      {#if $errors.chatModelId}
        <FormError error={$errors.chatModelId} />
      {/if}
    </label>

    {#if $errors._errors}
      <FormError error={$errors._errors} />
    {/if}

    {#if $message}
      <FormSuccess message={$message} />
    {/if}

    {#if !data.account.deleted}
      <input
        type="submit"
        value={$delayed ? "Saving..." : "Save"}
        class={`btn mt-5 w-full ${$delayed || !$changed ? "variant-filled-surface" : "variant-filled"}`}
        disabled={$delayed || !$changed}
      />
    {/if}
  </form>

  {#if !data.account.deleted}
    <form action="?/delete" method="post" class="w-full">
      <input
        type="submit"
        value="Delete account"
        class={`btn mt-5 w-full ${$delayed ? "variant-filled-surface" : "variant-filled-error"}`}
        disabled={$delayed}
      />
    </form>
  {:else}
    <form action="?/restore" method="post" class="w-full">
      <input
        type="submit"
        value="Restore account"
        class={`btn mt-5 w-full ${$delayed ? "variant-filled-surface" : "variant-filled-primary"}`}
        disabled={$delayed}
      />
    </form>

    <form action="?/permanentlyDelete" method="post" class="w-full">
      <input
        type="submit"
        value="Permanently delete account"
        class={`btn mt-5 w-full ${$delayed ? "variant-filled-surface" : "variant-filled-error"}`}
        disabled={$delayed}
      />
    </form>
  {/if}
</div>
