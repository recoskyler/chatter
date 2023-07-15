<script>
  import "../theme.postcss";
  import "@skeletonlabs/skeleton/styles/skeleton.css";
  import "../app.postcss";
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
