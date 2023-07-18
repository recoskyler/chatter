<script lang="ts">
  import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "$lib/constants";

  export let password: string;
</script>

<div class="card p-4 variant-filled" data-popup="popupFocusBlur">
  <p><strong>Password recommendations:</strong></p><br />

  <ul>
    <li class={password.length === 0 ? "" : password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH ? "text-green-700" : "text-red-700"}>Minimum 8, maximum 64 characters long</li>
    <li class={password.length === 0 ? "" : /(?=.*[a-z])/.test(password) ? "text-green-700" : "text-red-700"}>Minimum 1 lowercase letter (a-z)</li>
    <li class={password.length === 0 ? "" : /(?=.*[A-Z])/.test(password) ? "text-green-700" : "text-red-700"}>Minimum 1 uppercase letter (A-Z)</li>
    <li class={password.length === 0 ? "" : /(?=.*[0-9])/.test(password) ? "text-green-700" : "text-red-700"}>Minimum 1 number (0-9)</li>
    <li class={password.length === 0 ? "" : /(?=.*\W)/.test(password) ? "text-green-700" : "text-red-700"}>Minimum 1 special character (!@#$...)</li>
  </ul>

  <div class="arrow variant-filled" />
</div>
