<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    LightSwitch,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import Minidenticon from "components/Minidenticon.svelte";
  import { pageTitle } from "$lib/stores/pageTitle";
  import Fa from "svelte-fa";
  import {
    faEnvelope,
    faIdBadge,
    faKey,
    faTrash,
  } from "@fortawesome/free-solid-svg-icons";
  import { canGoBack } from "$lib/stores/canGoBack";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";
  import AnalyticsAccordion from "components/AnalyticsAccordion.svelte";

  export let data: PageData;

  $pageTitle = "Wizard Tower";
  $currentPage = CHATTER_PAGE.TOWER;
  $canGoBack = "/app";
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | Wizard Tower</title>
</svelte:head>

<main
  class=" h-full flex flex-col mx-auto my-auto p-5 max-w-md auto-cols-min"
  id="profile-cont"
>
  <div class="flex flex-row gap-5">
    <div class="flex justify-center items-center">
      <Minidenticon email={data.user.email} size={4} />
    </div>

    <div class="flex flex-col items-start gap-2">
      <h4 class="h4"><strong>{data.user.name}</strong></h4>
      <p>{data.user.email}</p>
    </div>
  </div>

  <form method="post" action="?/signOut" class="w-full mt-5">
    <input
      type="submit"
      value="Sign out"
      class="btn variant-filled-primary mt-5 w-full"
    />
  </form>

  <Accordion class="mt-10">
    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faIdBadge} />
      </svelte:fragment>

      <svelte:fragment slot="summary">
        Statistics
      </svelte:fragment>

      <svelte:fragment slot="content">
        <div class="flex flex-row align-middle justify-between">
          <p><strong>Users</strong></p>
          <p class="text-end">{data.stats.userCount}</p>
        </div>

        <div class="flex flex-row align-middle justify-between">
          <p><strong>Chats</strong></p>
          <p class="text-end">{data.stats.chatsCount}</p>
        </div>

        <div class="flex flex-row align-middle justify-between">
          <p><strong>Accounts</strong></p>
          <p class="text-end">{data.stats.accountsCount}</p>
        </div>
      </svelte:fragment>
    </AccordionItem>

    <!-- <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faEnvelope} />
      </svelte:fragment>

      <svelte:fragment slot="summary">Change email</svelte:fragment>

      <svelte:fragment slot="content">

      </svelte:fragment>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faKey} />
      </svelte:fragment>

      <svelte:fragment slot="summary">Change password</svelte:fragment>

      <svelte:fragment slot="content">

      </svelte:fragment>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faTrash} class="text-red-600 dark:text-red-400" />
      </svelte:fragment>

      <svelte:fragment slot="summary">
        <span class="text-red-600 dark:text-red-400">Delete account</span>
      </svelte:fragment>

      <svelte:fragment slot="content">

      </svelte:fragment>
    </AccordionItem> -->
  </Accordion>

  <div class="w-full flex items-center justify-center md:hidden mt-5">
    <LightSwitch bgDark="bg-surface-400" />
  </div>

  <!-- eslint-disable max-len -->
  <div
    class="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-10 py-2 px-5 bg-surface-200 dark:bg-surface-200 rounded-lg"
  >
    <!-- eslint-enable max-len -->
    <a
      href="/privacy"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      Privacy Policy
    </a>

    <a
      href="/disclaimer"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      Disclaimer
    </a>

    <a
      href="/cookie"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      Cookie Policy
    </a>

    <a
      href="https://github.com/recoskyler/chatter/blob/main/LICENSE"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      License
    </a>

    <a
      href="https://github.com/recoskyler/chatter"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
      data-umami-event="View source code anchor"
    >
      Source Code
    </a>
  </div>
</main>
