<script lang="ts">
  import type { PageData } from "./$types";
  import Fa from "svelte-fa";
  import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
  import { superForm } from "sveltekit-superforms/client";
  import { writable } from "svelte/store";
  import FormError from "components/FormError.svelte";

  export let data: PageData;

  const changed = writable(false);

  const { form, enhance, delayed, errors } = superForm(data.form, {
    onUpdated: () => {
      $changed = false;
    },
  });

  const availableAccounts = data.user.accounts.filter((a) => !a.deleted);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | Accounts</title>
</svelte:head>

<div class="h-full flex items-center p-5 flex-col gap-5">
  <form use:enhance method="post" class="w-full max-w-lg mx-auto p-5">
    <label class="label">
      <span>Default account</span>

      <select
        class="select w-full"
        name="accountId"
        disabled={$delayed}
        on:change={(_) => {
          $changed = true;
        }}
        bind:value={$form.accountId}
      >
        {#each availableAccounts as account}
          <option value={account.id}>{account.name}</option>
        {/each}
      </select>

      {#if $errors.accountId}
        <FormError error={$errors.accountId} />
      {/if}

      {#if $errors._errors}
        <FormError error={$errors._errors} />
      {/if}
    </label>

    <input
      type="submit"
      value={$delayed ? "Saving..." : "Save"}
      class={`btn mt-5 w-full ${
        $delayed || !$changed ? "variant-filled-surface" : "variant-filled"
      }`}
      disabled={$delayed || !$changed}
    />
  </form>

  <div class="container mx-auto max-w-lg p-3">
    {#if data.user.accounts}
      <dl class="list-dl" />

      <nav class="list-nav">
        <ul>
          <li>
            <a href={`/app/accounts/create`}>
              <span class="badge text-secondary-400">
                <Fa icon={faPlus} />
              </span>

              <span class="flex-auto">
                <span><strong>Create new account</strong></span>
              </span>
            </a>
          </li>

          {#each data.user.accounts as account}
            <li>
              <a href={`/app/accounts/${account.id}`}>
                <span class="badge text-secondary-400">
                  {#if account.deleted}
                    <Fa icon={faTrash} />
                  {:else}
                    <Fa icon={faPencil} />
                  {/if}
                </span>

                <span class="flex-auto">
                  <span class={account.deleted ? "text-slate-400" : ""}>
                    {account.name}
                  </span>
                </span>

                <span
                  class={`badge ml-3 ${
                    account.deleted
                      ? "variant-filled-error"
                      : data.user.config.defaultAccountId === account.id
                      ? "variant-filled-primary"
                      : "variant-filled"
                  }`}
                >
                  {account.chatModel.displayName}
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {:else}
      <p class="text-slate-400">You don't have any accounts</p>
    {/if}
  </div>
</div>
