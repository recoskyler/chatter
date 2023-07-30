<script lang="ts">
  import {
    AppBar,
    AppRail,
    AppRailAnchor,
    AppShell,
  } from "@skeletonlabs/skeleton";
  import Minidenticon from "components/Minidenticon.svelte";
  import type { LayoutData } from "./$types";
  import Fa from "svelte-fa";
  import {
    faArrowLeft,
    faMessage,
    faUsers,
  } from "@fortawesome/free-solid-svg-icons";
  import { selectedChat } from "$lib/stores/selectedChat";
  import { pageTitle } from "$lib/stores/pageTitle";
  import { canGoBack } from "$lib/stores/canGoBack";
  import { goto } from "$app/navigation";

  $canGoBack = null;

  export let data: LayoutData;
</script>

<AppShell class="h-screen">
  <svelte:fragment slot="header">
    <AppBar
      gridColumns="grid-cols-3"
      slotDefault="place-self-center"
      slotTrail="place-content-end"
    >
      <svelte:fragment slot="lead">
        {#if $canGoBack}
          <button
            aria-label="Go back"
            title="Go back"
            class="p-2 ml-2"
            on:click={() => {
              goto($canGoBack ?? "");
              $canGoBack = null;
            }}
          >
            <Fa icon={faArrowLeft} />
          </button>
        {:else}
          <span />
        {/if}
      </svelte:fragment>

      <h3 class="h3">{$pageTitle}</h3>

      <svelte:fragment slot="trail">
        <span />
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="pageHeader">
    {#if $selectedChat}
      <div>
        <form method="post" action="?/rename" />
      </div>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <AppRail>
      <AppRailAnchor selected={$pageTitle === "Chatter"} href="/app">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faMessage} />
          </div>
        </svelte:fragment>

        <span>Chats</span>
      </AppRailAnchor>

      <AppRailAnchor selected={$pageTitle === "Accounts"} href="/app/accounts">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faUsers} />
          </div>
        </svelte:fragment>

        <span>Accounts</span>
      </AppRailAnchor>

      <AppRailAnchor selected={$pageTitle === "Profile"} href="/app/profile">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Minidenticon email={data.user.email} size={1.5} />
          </div>
        </svelte:fragment>

        <span>Profile</span>
      </AppRailAnchor>
    </AppRail>
  </svelte:fragment>

  <slot />

  <svelte:fragment slot="pageFooter" />
</AppShell>
