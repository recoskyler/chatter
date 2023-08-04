<script lang="ts">
  import logo from "$lib/assets/chatter.svg";
</script>

<div class="logo flex flex-row items-center gap-2 justify-center flex-wrap">
  <img src={logo} alt="Logo" id="logo-img">
  <a href="/" class="h1"><strong>Chatter</strong></a>
</div>

<style lang="scss">
  .logo {
    margin-bottom: 2rem;

    > a {
      font-family: 'changoregular', 'rubik', sans-serif;
      transition: all 200ms ease-in-out;
    }

    > a:hover {
      letter-spacing: 0.3ch !important;
    }
  }

  #logo-img {
    width: 3.5rem;
    height: 3.5rem;
  }
</style>
