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

  storeHighlightJs.set(hljs);
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  function setCookie(name: string, value: string, expirationInDays: number) {
    const d = new Date();
    d.setTime(d.getTime() + expirationInDays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  function getCookie(name: string) {
    let cookieName = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return "";
  }

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
