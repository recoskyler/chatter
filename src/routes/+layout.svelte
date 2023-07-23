<script>
  import "styles/theme.postcss";
  import "@skeletonlabs/skeleton/styles/skeleton.css";
  import "styles/app.postcss";
	import { Modal, Toast, storePopup } from "@skeletonlabs/skeleton";
  import {
    computePosition, autoUpdate, offset, shift, flip, arrow,
  } from "@floating-ui/dom";

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<Modal />
<Toast />

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
