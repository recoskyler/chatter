<script>
  import "../theme.postcss";
  import "@skeletonlabs/skeleton/styles/skeleton.css";
  import "../app.postcss";
  import "styles/styles.scss";
	import { Toast, storePopup } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

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
