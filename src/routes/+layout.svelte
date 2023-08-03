<script lang="ts">
  import "styles/theme.postcss";
  import "@skeletonlabs/skeleton/styles/skeleton.css";
  import "styles/app.postcss";
  import "highlight.js/styles/github-dark.css";
  import { Modal, Toast, storePopup, toastStore } from "@skeletonlabs/skeleton";
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

  storeHighlightJs.set(hljs);
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  onMount(() => {
    if (getCookie("disclaimer-dismissed") === "") {
      toastStore.trigger({
        message:
          "This site uses cookies. <a href='/cookie' rel='noopener noreferrer' target='_blank' class='anchor'>Cookie Policy</a>",
        autohide: false,
        callback: (response) => {
          if (response.status === "closed") {
            setCookie("disclaimer-dismissed", "true", 365);
          }
        },
        background: "variant-filled-warning",
      });
    }
  });
</script>

<Modal />
<Toast />

<div class="app">
  <slot />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
</style>
