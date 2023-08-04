<script lang="ts">
  import { version } from "$app/environment";
  import BigLogo from "components/BigLogo.svelte";
</script>

<svelte:head>
  <title>Chatter | Simple, free, and open-source ChatGPT client</title>
</svelte:head>

<div
  class="flex flex-col my-auto mx-auto items-center justify-center text-center gap-5 py-10 px-5"
>
  <BigLogo />

  <p>Simple, free, and open-source ChatGPT client</p>

  <div class="flex flex-row gap-5 items-center justify-center flex-wrap">
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
    class="w-full flex flex-row gap-5 items-center justify-center text-slate-500 dark:text-slate-400 flex-wrap"
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
