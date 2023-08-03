<script lang="ts">
  import { version } from "$app/environment";
  import { getCookie } from "$lib/functions/helper";
  import BigLogo from "components/BigLogo.svelte";

  const doNotTrack =
    getCookie("chatter_do_not_track") === "true" ? "true" : "false";
</script>

<svelte:head>
  <script
    async
    defer
    src="https://umami.recoskyler.com/script.js"
    data-website-id="607f67a0-703e-42b6-8397-eb932fb71ba6"
    data-do-not-track={doNotTrack}
    data-cache="true"
  ></script>

  <title>Chatter | Simple, free, and open-source ChatGPT client</title>
</svelte:head>

<div
  class="flex flex-col my-auto mx-auto items-center justify-center text-center gap-5"
>
  <BigLogo />

  <p>Simple, free, and open-source ChatGPT client</p>

  <div class="flex flex-row gap-5 items-center justify-center">
    <a href="/app" class="btn variant-filled" data-umami-event="Launch button">
      Launch Chatter
    </a>

    <a
      href="/app"
      class="btn variant-ghost-tertiary"
      data-umami-event="View source code button"
    >
      View source code
    </a>
  </div>

  <div
    class="flex flex-row gap-5 items-center justify-center text-slate-500 dark:text-slate-400"
  >
    <span>
      <span>By </span>
      <a
        href="https://github.com/recoskyler"
        target="_blank"
        rel="noopener noreferrer"
        class="anchor"
        data-umami-event="View recoskyler button"
      >
        recoskyler
      </a>
    </span>
    <p>v{version}</p>
  </div>
</div>
