<script>
  import Header from "./Header.svelte";
  import NavBar from "./NavBar.svelte";
import "./styles.scss";
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
