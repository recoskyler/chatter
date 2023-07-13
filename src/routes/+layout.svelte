<script>
  import "styles/styles.scss";
</script>

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
