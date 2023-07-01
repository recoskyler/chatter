<script>
  // import Header from "components/Header.svelte";
  import NavBar from "components/NavBar.svelte";
  import "styles/styles.scss";
</script>

<div class="app">
  <!-- <Header /> -->

  <NavBar />

  <slot />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
</style>
