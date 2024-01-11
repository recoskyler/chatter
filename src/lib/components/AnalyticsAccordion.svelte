<script lang="ts">
  import {
    AccordionItem,
    SlideToggle,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "../../routes/app/profile/$types";
  import Fa from "svelte-fa";
  import {
    faChartSimple,
  } from "@fortawesome/free-solid-svg-icons";
  import { getCookie, setCookie } from "$lib/functions/helper";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { DO_NOT_TRACK_COOKIE_NAME } from "$lib/constants";

  let analyticsEnabled = false;

  const toggleAnalytics = () => {
    if (!browser) {
      console.error("Not a browser. Cannot save settings");

      return;
    }

    setCookie(
      DO_NOT_TRACK_COOKIE_NAME,
      analyticsEnabled ? "false" : "true",
      365,
    );

    console.info(`${analyticsEnabled ? "Enabled" : "Disabled"} analytics`);
  };

  onMount(() => {
    const cookieVal = getCookie(DO_NOT_TRACK_COOKIE_NAME);
    analyticsEnabled = cookieVal === "false" || cookieVal === "" ? true : false;
  });
</script>

<AccordionItem>
  <svelte:fragment slot="lead">
    <Fa fw icon={faChartSimple} />
  </svelte:fragment>

  <svelte:fragment slot="summary">Analytics</svelte:fragment>

  <svelte:fragment slot="content">
    <p>
      <span class="text-orange-600 dark:text-orange-400"
        ><strong>WARNING: </strong></span
      >
      <!-- eslint-disable-next-line max-len -->
      This setting is stored in a cookie. When you sign out, clear the browser cookies,
      or block cookies it will be reset to its default state (<strong
        >Disabled</strong
      >)
    </p>

    <SlideToggle
      name="enabled"
      bind:checked={analyticsEnabled}
      on:change={toggleAnalytics}
      bgDark="bg-surface-400"
      class="my-3"
    >
      Enable analytics?
    </SlideToggle>

    <p>
      <strong>Please refresh the page after changing this option</strong>
    </p>
  </svelte:fragment>
</AccordionItem>
