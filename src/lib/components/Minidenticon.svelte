<script lang="ts">
  import { minidenticon } from "minidenticons";

  export let email = "";
  export let imgClass = "";
  export let size = 3;
  export let saturation: string | number | undefined = undefined;
  export let lightness: string | number | undefined = undefined;

  const svgUri = `data:image/svg+xml;utf8,${encodeURIComponent(
    minidenticon(email, saturation, lightness)
  )}`;
</script>

<img
  src={svgUri}
  alt={email}
  class={`minidenticon bg-slate-800 dark:bg-slate-200 ${imgClass}`}
  style={`width:${size}rem; height:${size}rem;`}
/>

<style>
  .minidenticon {
    border-radius: 50%;
  }
</style>
