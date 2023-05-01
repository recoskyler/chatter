<script lang="ts">
  import { chats } from "./chat";

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
</script>

<footer>
  <progress
    id="storage"
    max="100"
    value={new TextEncoder().encode(JSON.stringify($chats)).length / 50000}
  >
    {new TextEncoder().encode(JSON.stringify($chats)).length / 50000}%
  </progress>

  <span class="storage-text">
    {formatBytes(
      new TextEncoder().encode(JSON.stringify($chats)).length,
      2
    )} of 5 MB
    <a
      target="_blank"
      href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria"
    >
      Local Storage</a
    > Used
  </span>

  <p>
    <span>Made with </span>

    <a href="/deniz">🫀</a>

    <span> by </span>

    <a target="_blank" href="https://github.com/recoskyler"> recoskyler </a>

    <span> — </span>

    <a target="_blank" href="https://github.com/recoskyler/chatter">
      GitHub
    </a>

    <br />

    <span id="version">v{import.meta.env.VITE_APP_VERSION}</span>
  </p>
</footer>

<style lang="scss">
  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
    color: rgba(255, 255, 255, 0.7);

    p {
      text-align: center;
    }
  }

  footer a {
    font-weight: bold;
  }

  .storage-text {
    font-size: x-small;
    color: rgba(255, 255, 255, 0.4);
  }

  .storage-text > a {
    $color-theme-1: var(--color-theme-1);
    color: rgba($color-theme-1, 0.4);
  }

  #version {
    color:rgba(255, 255, 255, 0.4);
  }
</style>
