<script lang="ts">
  import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
  import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
  import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
  import { ProgressBar } from "@skeletonlabs/skeleton";
  import {
    passwordStrengthColorLevels,
    passwordStrengthLevels,
  } from "./helpers";

  const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  };

  zxcvbnOptions.setOptions(options);

  export let password = "";

  /* eslint-disable-next-line prefer-destructuring */
  $: score = zxcvbn(password).score;
</script>

<label
  for="strength"
  class="label mb-2 mt-3 text-slate-600 dark:text-slate-400"
>
  Password strength:
  <strong>
    <span class={`label ${passwordStrengthColorLevels[score]}`}>
      {passwordStrengthLevels[score]}</span
    >
  </strong>
</label>

<ProgressBar id="strength" label="Password strength" value={score} max={4} />
<br />
