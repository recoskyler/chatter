<script lang="ts">
  import Logo from "components/Logo.svelte";
  import Footer from "components/Footer.svelte";

  function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) : str;
  }

  function download(data: BlobPart, filename: string, type?: string) {
    console.log("Downloading...");

    const file = new Blob([ data ], { type: type });
    const finalName = `chatter__${ truncate(filename, 15)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase() }`;

    const a = document.createElement("a");
    const url = URL.createObjectURL(file);

    a.href = url;
    a.download = finalName;

    document.body.appendChild(a);
    a.click();

    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
</script>

<div class="navbar">
  <nav>
    <Logo />
  </nav>

  <Footer />
</div>

<style lang="scss">
  .navbar {
    width: clamp(20ch, 35ch, 50ch);
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 3ch 2ch;
    top: 0;
    left: 0;
    height: calc(100vh - 6ch);
    background-color: var(--color-bg-2);
  }

  nav {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 90vh;
  }
</style>
