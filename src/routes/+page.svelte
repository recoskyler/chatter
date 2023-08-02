<script lang="ts">
  import { version } from "$app/environment";
  import BigLogo from "components/BigLogo.svelte";
</script>

<div
  class="flex flex-col my-auto mx-auto items-center justify-center text-center gap-5"
>
  <BigLogo />

  <p>Free and open-source ChatGPT client</p>

  <div class="flex flex-row gap-5 items-center justify-center">
    <a href="/app" class="btn variant-filled">Launch Chatter</a>
    <a href="/app" class="btn variant-ghost-tertiary">View source code</a>
  </div>

  <div class="flex flex-row gap-5 items-center justify-center text-slate-500 dark:text-slate-400">
    <span>
      <span>By </span>
      <a
        href="https://github.com/recoskyler"
        target="_blank"
        rel="noopener noreferrer"
        class="anchor"
      >
        recoskyler
      </a>
    </span>
    <p> v{version}</p>
  </div>
</div>
