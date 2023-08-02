<script lang="ts">
  import {
    AppBar,
    AppRail,
    AppRailAnchor,
    AppShell,
    LightSwitch,
    TabAnchor,
    TabGroup,
  } from "@skeletonlabs/skeleton";
  import Minidenticon from "components/Minidenticon.svelte";
  import type { LayoutData } from "./$types";
  import Fa from "svelte-fa";
  import {
    faArrowLeft,
    faMessage,
    faUsers,
  } from "@fortawesome/free-solid-svg-icons";
  import { pageTitle } from "$lib/stores/pageTitle";
  import { goto } from "$app/navigation";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";
  import { canGoBack } from "$lib/stores/canGoBack";
  import githubWhite from "$lib/assets/github-mark-white.svg";
  import githubBlack from "$lib/assets/github-mark.svg";
  import { page } from "$app/stores";
  import Logo from "components/Logo.svelte";

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

      {#if $page.url.pathname === "/app"}
        <Logo />
      {:else}
        <h3 class="h3">
          {$pageTitle}
        </h3>
      {/if}

      <svelte:fragment slot="trail">
        <div class="flex flex-row items-center justify-center">
          <LightSwitch bgDark="bg-surface-400 hidden md:block" />

          <a
            href="https://github.com/recoskyler/chatter"
            class="px-3"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              <img
                src={githubWhite}
                alt="View on GitHub"
                style="width: 1.5rem; height: 1.5rem;"
                class="hidden dark:block"
              />

              <img
                src={githubBlack}
                alt="View on GitHub"
                style="width: 1.5rem; height: 1.5rem;"
                class="block dark:hidden"
              />
            </span>
          </a>
        </div>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <AppRail class="hidden md:block">
      <AppRailAnchor selected={$currentPage === CHATTER_PAGE.CHATS} href="/app">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faMessage} />
          </div>
        </svelte:fragment>

        <span>Chats</span>
      </AppRailAnchor>

      <AppRailAnchor
        selected={$currentPage === CHATTER_PAGE.ACCOUNTS}
        href="/app/accounts"
      >
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faUsers} />
          </div>
        </svelte:fragment>

        <span>Accounts</span>
      </AppRailAnchor>

      <AppRailAnchor
        selected={$currentPage === CHATTER_PAGE.PROFILE}
        href="/app/profile"
      >
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

  <svelte:fragment slot="footer">
    <TabGroup
      justify="justify-center"
      active="variant-filled-primary"
      hover="hover:variant-soft-primary"
      flex="flex-1 lg:flex-none"
      rounded=""
      border=""
      class="bg-surface-100-800-token w-full block md:hidden"
    >
      <TabAnchor selected={$currentPage === CHATTER_PAGE.CHATS} href="/app">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faMessage} />
          </div>
        </svelte:fragment>

        <span>Chats</span>
      </TabAnchor>

      <TabAnchor
        selected={$currentPage === CHATTER_PAGE.ACCOUNTS}
        href="/app/accounts"
      >
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faUsers} />
          </div>
        </svelte:fragment>

        <span>Accounts</span>
      </TabAnchor>

      <TabAnchor
        selected={$currentPage === CHATTER_PAGE.PROFILE}
        href="/app/profile"
      >
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Minidenticon email={data.user.email} size={1} />
          </div>
        </svelte:fragment>

        <span>Profile</span>
      </TabAnchor>
    </TabGroup>
  </svelte:fragment>
</AppShell>
