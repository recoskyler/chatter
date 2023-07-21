<script lang="ts">
  import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
  import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
  import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
  import { ProgressBar } from "@skeletonlabs/skeleton";

  const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  };

  zxcvbnOptions.setOptions(options);

  export const levels = [
    "Super weak",
    "Very weak",
    "Weak",
    "Strong",
    "Very strong",
  ];

  export const colorLevels = [
    "text-red-600",
    "text-red-500",
    "text-orange-400",
    "text-green-300",
    "text-green-500",
  ];

  export let password = "";

  /* eslint-disable-next-line prefer-destructuring */
  $: score = zxcvbn(password).score;
</script>

<label for="strength" class="label mb-2 mt-3 text-slate-500">
  Password strength:
  <strong>
    <span class={`label ${colorLevels[score]}`}> {levels[score]}</span>
  </strong>
</label>

<ProgressBar id="strength" label="Password strength" value={score} max={4} />
<br />
