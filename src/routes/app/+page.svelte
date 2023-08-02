<script lang="ts">
  import type { PageData } from "./$types";
  import Fa from "svelte-fa";
  import { faMessage, faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
  import { writable } from "svelte/store";
  import FormError from "components/FormError.svelte";
  import { MAX_CHATS } from "$lib/constants";
  import { pageTitle } from "$lib/stores/pageTitle";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";
  import { canGoBack } from "$lib/stores/canGoBack";

  export let data: PageData;

  $currentPage = CHATTER_PAGE.CHATS;
  $pageTitle = "Chatter";
  $canGoBack = null;
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | App</title>
</svelte:head>

{#if data.user.chats.length === 0}
  <div class="h-full w-full flex flex-col items-center justify-center gap-5">
    <p class="text-center text-slate-500 dark:text-slate-400">You don't have any chats</p>

    <a href="/app/chat/create" class="btn variant-filled">Create chat</a>
  </div>
{:else}
  <div class="h-full flex items-center p-2 flex-col gap-5">
    <div class="container mx-auto max-w-lg">
      {#if data.user.chats.length >= MAX_CHATS}
        <FormError
          error={`You have reached the limit of ${MAX_CHATS} chats. Please permanently delete unused chats before attempting to create new chats.`}
        />
      {/if}

      {#if data.user.chats}
        <nav class="list-nav">
          <ul>
            {#if data.user.chats.length < MAX_CHATS}
              <li>
                <a href={`/app/chat/create`}>
                  <span class="badge text-secondary-700 dark:text-secondary-400">
                    <Fa fw icon={faPlus} />
                  </span>

                  <span class="flex-auto">
                    <span><strong>Create new chat</strong></span>
                  </span>
                </a>
              </li>
            {/if}

            {#each data.user.chats as chat}
              <li>
                <a href={`/app/chat/${chat.id}`}>
                  <span class="badge text-secondary-700 dark:text-secondary-400">
                    {#if chat.deleted}
                      <Fa fw icon={faTrash} />
                    {:else}
                      <Fa fw icon={faMessage} />
                    {/if}
                  </span>

                  <span class="flex-auto">
                    <span class={chat.deleted ? "text-slate-400" : ""}>
                      {chat.name}
                    </span>
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      {/if}
    </div>
  </div>
{/if}
