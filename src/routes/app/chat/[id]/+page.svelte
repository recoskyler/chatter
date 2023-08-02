<script lang="ts">
  import { superForm } from "sveltekit-superforms/client";
  import type { PageData } from "./$types";
  import FormError from "components/FormError.svelte";
  import FormSuccess from "components/FormSuccess.svelte";
  import { writable } from "svelte/store";
  import {
    SlideToggle,
    Accordion,
    AccordionItem,
    toastStore,
    CodeBlock,
  } from "@skeletonlabs/skeleton";
  import Fa from "svelte-fa";
  import {
    faGear,
    faQuestionCircle,
    faRobot,
    faToggleOff,
    faToggleOn,
    faUser,
  } from "@fortawesome/free-solid-svg-icons";
  import { pageTitle } from "$lib/stores/pageTitle";
  import { prompts } from "$lib/stores/prompts";
  import { onMount } from "svelte";
  import { selectPromptSchema, type Prompt } from "$lib/db/types";
  import { z } from "zod";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";
  import { canGoBack } from "$lib/stores/canGoBack";

  export let data: PageData;

  const nameChanged = writable(false);
  const systemChanged = writable(false);
  const accountChanged = writable(false);
  const contentHeight = writable(0);

  $prompts = data.user.chats[0].prompts;

  const {
    form: chatForm,
    errors: chatErrors,
    constraints: chatConstraints,
    enhance: chatEnhance,
    delayed: chatDelayed,
  } = superForm(data.chatForm, {
    onUpdated: ({ form }) => {
      const promptArraySchema = z.array(selectPromptSchema);
      const data = JSON.parse(form.message);
      const res = promptArraySchema.safeParse(data);

      if (!res.success) {
        toastStore.trigger({
          message: "Invalid returned result",
          background: "variant-filled-warning",
        });

        console.error(res.error);

        return;
      }

      const deDuplicatedRes: Prompt[] = [];

      for (const prompt of res.data) {
        if (!$prompts.find((p) => p.id === prompt.id)) {
          deDuplicatedRes.push(prompt);
        }
      }

      $prompts = $prompts.concat(deDuplicatedRes);
      $chatForm.content = "";
    },
  });

  const {
    form: renameForm,
    errors: renameErrors,
    constraints: renameConstraints,
    message: renameMessage,
    enhance: renameEnhance,
    delayed: renameDelayed,
  } = superForm(data.renameForm, {
    onUpdated: () => {
      $nameChanged = false;
      $pageTitle = data.user.chats[0].name ?? "Chatter";
    },
  });

  const {
    form: systemForm,
    errors: systemErrors,
    constraints: systemConstraints,
    message: systemMessage,
    enhance: systemEnhance,
    delayed: systemDelayed,
  } = superForm(data.systemForm, {
    onUpdated: () => {
      $systemChanged = false;
    },
  });

  const {
    form: toggleForm,
    errors: toggleErrors,
    constraints: toggleConstraints,
    message: toggleMessage,
    enhance: toggleEnhance,
    delayed: toggleDelayed,
  } = superForm(data.toggleForm, {
    onUpdated: ({ form }) => {
      const prompt = $prompts.find((p) => p.id === form.data.promptId);

      if (!prompt) return;

      const index = $prompts.indexOf(prompt);

      $prompts[index].enabled = !form.data.previousState;
    },
  });

  const {
    form: accountForm,
    errors: accountErrors,
    enhance: accountEnhance,
    delayed: accountDelayed,
  } = superForm(data.accountForm, {
    onUpdated: () => {
      $accountChanged = false;
    },
  });

  const {
    errors: deleteErrors,
    enhance: deleteEnhance,
    delayed: deleteDelayed,
  } = superForm(data.deleteForm);

  const {
    errors: permDeleteErrors,
    enhance: permDeleteEnhance,
    delayed: permDeleteDelayed,
  } = superForm(data.permDeleteForm);

  const {
    errors: restoreErrors,
    enhance: restoreEnhance,
    delayed: restoreDelayed,
  } = superForm(data.restoreForm);

  let chatFormElem: HTMLFormElement;
  let ctrlPressed = false;
  let enterPressed = false;

  $pageTitle = data.user.chats[0].name ?? "Chatter";
  $currentPage = CHATTER_PAGE.CHATS;
  $canGoBack = "/app";

  onMount(() => {
    $contentHeight = document
      .getElementsByClassName("app-bar")[0]
      .getBoundingClientRect().height;
  });

  const availableAccounts = data.user.accounts.filter((a) => !a.deleted);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | {data.user.chats[0]?.name}</title>
</svelte:head>

{#if data.user.config.defaultAccountId === null}
  <div
    class="flex flex-col gap-5 w-full items-center justify-center"
    style={`height: calc(100vh - ${$contentHeight}px);`}
  >
    <p class="text-slate-400">
      You must create/select a default account from the
      <a href="/app/accounts" class="anchor">Accounts</a>
      page before you can chat.
    </p>

    <a href="/app/accounts" class="btn variant-filled"> Go to accounts </a>
  </div>
{:else}
  <div
    class={`flex flex-col w-full items-center`}
    style={`height: calc(100vh - ${$contentHeight}px);`}
  >
    <Accordion
      class="mx-auto w-full max-w-3xl flex-none py-3"
      id="chat-config-accordion"
    >
      <AccordionItem>
        <svelte:fragment slot="lead"><Fa icon={faGear} /></svelte:fragment>
        <svelte:fragment slot="summary">Chat configuration</svelte:fragment>
        <svelte:fragment slot="content">
          <div class="bg-surface-200 dark:bg-surface-400 p-2 rounded-lg">
            <form
              use:renameEnhance
              action="?/rename"
              method="post"
              class="flex flex-row gap-2 mx-auto w-full max-w-3xl items-end justify-stretch"
            >
              <div class="w-full">
                <input
                  name="name"
                  class="input w-full"
                  type="text"
                  placeholder="Chat name"
                  disabled={$renameDelayed}
                  on:input={(_) => {
                    $nameChanged = true;
                  }}
                  bind:value={$renameForm.name}
                  {...$renameConstraints.name}
                />

                {#if $renameErrors.name}
                  <FormError error={$renameErrors.name} />
                {/if}

                {#if $renameErrors._errors}
                  <FormError error={$renameErrors._errors} />
                {/if}

                {#if $renameMessage}
                  <FormSuccess message={$renameMessage} />
                {/if}
              </div>

              {#if $nameChanged}
                <input
                  type="submit"
                  value={$renameDelayed ? "Renaming..." : "Rename"}
                  class={`btn ${
                    $renameDelayed || !$nameChanged
                      ? "variant-filled-surface"
                      : "variant-filled"
                  }`}
                  disabled={$renameDelayed || !$nameChanged}
                />
              {/if}
            </form>

            <form
              use:systemEnhance
              action="?/updateSystem"
              method="post"
              class="flex flex-row gap-2 mx-auto w-full max-w-3xl items-end justify-stretch"
            >
              <label class="label mt-2 w-full">
                <span class="flex flex-row gap-2 items-center">
                  <span>System prompt</span>
                  <span>
                    <a
                      href="https://github.com/recoskyler/chatter#what-is-a-system-prompt"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="cursor-help"
                    >
                      <Fa icon={faQuestionCircle} />
                    </a>
                  </span>
                </span>

                <input
                  name="prompt"
                  class="input"
                  type="text"
                  placeholder="You are a helpful assistant"
                  disabled={$systemDelayed}
                  on:input={(_) => {
                    $systemChanged = true;
                  }}
                  bind:value={$systemForm.prompt}
                  {...$systemConstraints.prompt}
                />

                {#if $systemErrors.prompt}
                  <FormError error={$systemErrors.prompt} />
                {/if}

                {#if $systemErrors._errors}
                  <FormError error={$systemErrors._errors} />
                {/if}

                {#if $systemMessage}
                  <FormSuccess message={$systemMessage} />
                {/if}
              </label>

              {#if $systemChanged}
                <input
                  type="submit"
                  value={$systemDelayed ? "Saving..." : "Save"}
                  class={`btn ${
                    $systemDelayed || !$systemChanged
                      ? "variant-filled-surface"
                      : "variant-filled"
                  }`}
                  disabled={$systemDelayed || !$systemChanged}
                />
              {/if}
            </form>

            <form
              use:accountEnhance
              method="post"
              action="?/changeAccount"
              class="flex flex-row gap-2 mx-auto w-full max-w-3xl items-end justify-stretch"
            >
              <label class="label mt-2 w-full">
                <span>Default account</span>

                <select
                  class="select w-full"
                  name="accountId"
                  disabled={$accountDelayed}
                  on:change={(_) => {
                    $accountChanged = true;
                  }}
                  bind:value={$accountForm.accountId}
                >
                  {#each availableAccounts as account}
                    <option value={account.id}>{account.name}</option>
                  {/each}
                </select>

                {#if $accountErrors.accountId}
                  <FormError error={$accountErrors.accountId} />
                {/if}

                {#if $accountErrors._errors}
                  <FormError error={$accountErrors._errors} />
                {/if}
              </label>

              {#if $accountChanged}
                <input
                  type="submit"
                  value={$accountDelayed ? "Saving..." : "Save"}
                  class={`btn ${
                    $accountDelayed || !$accountChanged
                      ? "variant-filled-surface"
                      : "variant-filled"
                  }`}
                  disabled={$accountDelayed || !$accountChanged}
                />
              {/if}
            </form>

            {#if !data.user.chats[0].deleted}
              <form
                use:deleteEnhance
                id="delete-form"
                method="post"
                action="?/delete"
                class="flex flex-row gap-5 mx-auto w-full max-w-3xl items-end justify-stretch"
              >
                <input
                  type="submit"
                  value={$deleteDelayed ? "Deleting..." : "Delete chat"}
                  class={`btn mt-2 w-full ${
                    $deleteDelayed
                      ? "variant-filled-surface"
                      : "variant-filled-error"
                  }`}
                  disabled={$deleteDelayed}
                />

                {#if $deleteErrors._errors}
                  <FormError error={$deleteErrors._errors} />
                {/if}
              </form>
            {:else}
              <div class="flex flex-row w-full mt-2 gap-2">
                <form
                  use:restoreEnhance
                  id="restore-form"
                  method="post"
                  action="?/restore"
                  class="flex flex-row gap-5 mx-auto w-full max-w-3xl items-end justify-stretch"
                >
                  <input
                    type="submit"
                    value={$restoreDelayed ? "Restoring..." : "Restore chat"}
                    class={`btn w-full ${
                      $restoreDelayed
                        ? "variant-filled-surface"
                        : "variant-filled"
                    }`}
                    disabled={$restoreDelayed}
                  />

                  {#if $restoreErrors._errors}
                    <FormError error={$restoreErrors._errors} />
                  {/if}
                </form>

                <form
                  use:permDeleteEnhance
                  id="perm-delete-form"
                  method="post"
                  action="?/permanentlyDelete"
                  class="flex flex-row gap-5 mx-auto w-full max-w-3xl items-end justify-stretch"
                >
                  <input
                    type="submit"
                    value={$permDeleteDelayed
                      ? "Deleting..."
                      : "Permanently delete chat"}
                    class={`btn w-full ${
                      $permDeleteDelayed
                        ? "variant-filled-surface"
                        : "variant-filled-error"
                    }`}
                    disabled={$permDeleteDelayed}
                  />

                  {#if $permDeleteErrors._errors}
                    <FormError error={$permDeleteErrors._errors} />
                  {/if}
                </form>
              </div>
            {/if}
          </div>
        </svelte:fragment>
      </AccordionItem>
    </Accordion>

    <div
      class={`flex flex-col-reverse flex-grow max-w-3xl w-full mx-auto py-2 overflow-y-auto`}
    >
      {#if $prompts.length <= 1}
        <p class="my-auto text-slate-500 dark:text-slate-400 text-center">
          Enter a prompt below to start chatting.
        </p>
      {:else}
        {#each $prompts
          .filter((p) => p.role !== "system")
          .reverse() as prompt, i}
          <div class="py-4 flex flex-row items-center gap-3">
            <div class="flex flex-col items-center gap-2">
              <Fa
                fw
                icon={prompt.role === "user" ? faUser : faRobot}
                class={prompt.busy
                  ? "text-slate-400 dark:text-slate-600"
                  : !prompt.successful
                  ? "text-red-600 dark:text-red-400"
                  : prompt.role === "assistant"
                  ? "text-slate-600 dark:text-slate-300 font-mono"
                  : $chatForm.remember && !prompt.enabled
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-tertiary-600 dark:text-tertiary-400"}
              />

              {#if !prompt.busy && prompt.successful && prompt.role === "user" && $chatForm.remember}
                <form use:toggleEnhance action="?/toggle" method="post">
                  <input type="hidden" name="promptId" value={prompt.id} />
                  <input
                    type="hidden"
                    name="previousState"
                    value={prompt.enabled}
                  />

                  <button aria-label="Toggle prompt" title="Toggle prompt">
                    <Fa
                      fw
                      icon={prompt.enabled ? faToggleOn : faToggleOff}
                      class={!prompt.enabled
                        ? "text-slate-500 dark:text-slate-400"
                        : "text-tertiary-600 dark:text-tertiary-400"}
                    />
                  </button>
                </form>
              {/if}
            </div>

            <div class="flex flex-col">
              {#each prompt.content.split("```") as piece, p}
                {#if piece.length > 0}
                  {#if p % 2 === 1 && prompt.content.includes("```")}
                    <CodeBlock
                      language={piece.split("\n")[0]}
                      code={piece
                        .substring(
                          piece.split("").findIndex((c) => c === "\n") + 1
                        )
                        .trim()}
                    />
                  {:else}
                    <p
                      class={`pre m-0 p-0 w-full bg-inherit ${
                        prompt.busy
                          ? "text-slate-400 dark:text-slate-600"
                          : !prompt.successful
                          ? "text-red-600 dark:text-red-400"
                          : prompt.role === "assistant"
                          ? "text-slate-600 dark:text-slate-300 font-mono"
                          : $chatForm.remember && !prompt.enabled
                          ? "text-slate-500 dark:text-slate-400"
                          : "text-tertiary-600 dark:text-tertiary-400"
                      }`}
                    >
                      {piece}
                    </p>
                  {/if}
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <form
      id="chat-form"
      use:chatEnhance
      bind:this={chatFormElem}
      action="?/submit"
      method="post"
      class="flex-none flex flex-row gap-2 mx-auto my-2 justify-stretch items-center w-full max-w-3xl bg-surface-200 dark:bg-surface-400 rounded-lg p-2"
    >
      <div class="w-full">
        <textarea
          tabindex={1}
          name="content"
          class="textarea w-full"
          placeholder={data.user.chats[0].prompts.length === 0
            ? "You are a helpful assistant"
            : "Explain why I'm sad"}
          disabled={$chatDelayed}
          rows={2}
          on:keyup={(e) => {
            if (e.repeat) return;

            if (e.key === "Control") {
              ctrlPressed = false;
            }

            if (e.key === "Enter") {
              enterPressed = false;
            }
          }}
          on:keydown={(e) => {
            if (e.repeat) return;

            if (e.key === "Control") {
              ctrlPressed = true;
            }

            if (e.key === "Enter") {
              enterPressed = true;
            }

            if (ctrlPressed && enterPressed) {
              chatFormElem.requestSubmit();
            }
          }}
          bind:value={$chatForm.content}
          {...$chatConstraints.content}
        />

        <div class="flex flex-row items-center justify-between mt-2">
          <p>
            Press <kbd class="kbd">Ctrl + Enter</kbd> to submit
          </p>

          <SlideToggle
            tabindex={3}
            name="remember"
            label="Remember previous chat content"
            size="sm"
            bind:checked={$chatForm.remember}
          >
            <span class="flex flex-row items-center gap-2">
              <span>Remember</span>
              <span>
                <a
                  href="https://github.com/recoskyler/chatter#what-does-the-remember-toggle-do"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="cursor-help"
                >
                  <Fa icon={faQuestionCircle} />
                </a>
              </span>
            </span>
          </SlideToggle>
        </div>

        {#if $chatErrors.content}
          <FormError error={$chatErrors.content} />
        {/if}

        {#if $chatErrors._errors}
          <FormError error={$chatErrors._errors} />
        {/if}
      </div>

      <input
        tabindex={2}
        type="submit"
        value={$chatDelayed ? "Submitting..." : "Submit"}
        class={`btn h-auto ${
          $chatDelayed ? "variant-filled-surface" : "variant-filled"
        }`}
        disabled={$chatDelayed}
      />
    </form>
  </div>
{/if}
