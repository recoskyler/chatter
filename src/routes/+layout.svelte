<script lang="ts">
  import "styles/theme.postcss";
  import "@skeletonlabs/skeleton/styles/skeleton.css";
  import "styles/app.postcss";
  import "highlight.js/styles/github-dark.css";
  import {
    Modal, Toast, storePopup, toastStore,
  } from "@skeletonlabs/skeleton";
  import {
    computePosition,
    autoUpdate,
    offset,
    shift,
    flip,
    arrow,
  } from "@floating-ui/dom";
  import hljs from "highlight.js";
  import { storeHighlightJs } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import { getCookie, setCookie } from "$lib/functions/helper";
  import { DISCLAIMER_DISMISSED_COOKIE_NAME, DO_NOT_TRACK_COOKIE_NAME } from "$lib/constants";

  let doNotTrack = "";

  storeHighlightJs.set(hljs);
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  onMount(() => {
    if (getCookie(DISCLAIMER_DISMISSED_COOKIE_NAME) === "") {
      toastStore.trigger({
        message:
          "This site uses cookies. <a href='/cookie' rel='noopener noreferrer' target='_blank' class='anchor'>Cookie Policy</a>",
        autohide: false,
        callback: response => {
          if (response.status === "closed") {
            setCookie(DISCLAIMER_DISMISSED_COOKIE_NAME, "true", 365);
          }
        },
        background: "variant-filled-warning",
      });
    }

    const cookieVal = getCookie(DO_NOT_TRACK_COOKIE_NAME);
    doNotTrack = cookieVal === "false" || cookieVal === "" ? "false" : "true";
  });
</script>

<svelte:head>
  {#if doNotTrack !== ""}
    <script
      async
      defer
      src="https://umami.recoskyler.com/script.js"
      data-website-id="607f67a0-703e-42b6-8397-eb932fb71ba6"
      data-do-not-track={doNotTrack}
      data-cache="true"
    ></script>
  {/if}
</svelte:head>

<Modal />
<Toast />

<div class="app">
  <slot />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
  }
</style>
