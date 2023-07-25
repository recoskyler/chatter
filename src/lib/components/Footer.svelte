<script lang="ts">
  import { version } from '$app/environment';
</script>

<footer>
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

    <!-- svelte-ignore missing-declaration -->
    <!-- eslint-disable-next-line no-undef -->
    <span id="version">v{version}</span>
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

  #version {
    color:rgba(255, 255, 255, 0.4);
  }
</style>
