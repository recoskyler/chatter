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
  import { faMessage, faUsers } from "@fortawesome/free-solid-svg-icons";
  import { page } from "$app/stores";
  import { selectedChat } from "writables/selectedChat";
  import { pageTitle } from "writables/pageTitle";

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
        <AppRailAnchor selected={$page.route?.id === "/app"} href="/app">
          <svelte:fragment slot="lead">
            <span></span>
          </svelte:fragment>

          <span></span>
        </AppRailAnchor>
      </svelte:fragment>

      <h3 class="h3">{$pageTitle}</h3>

      <svelte:fragment slot="trail">
        <a href="/app/profile" class="btn variant-surface">
          <Minidenticon email={data.user.email} size={2} />
          <span class="pl-3"><strong>{data.user.name}</strong></span>
        </a>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="pageHeader">
    {#if $selectedChat}
      <div>
        <form method="post" action="?/rename">

        </form>
      </div>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <AppRail>
      <AppRailAnchor selected={$page.route?.id === "/app"} href="/app">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faMessage} />
          </div>
        </svelte:fragment>

        <span>Chats</span>
      </AppRailAnchor>

      <AppRailAnchor
        selected={$page.route?.id === "/app/accounts"}
        href="/app/accounts"
      >
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faUsers} />
          </div>
        </svelte:fragment>

        <span>Accounts</span>
      </AppRailAnchor>
    </AppRail>
  </svelte:fragment>

  <slot />

  <svelte:fragment slot="pageFooter" />
</AppShell>