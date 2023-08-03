<script lang="ts">
  import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "$lib/constants";

  export let password: string;

  const isLengthValid = (password: string) =>
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH;

  const containsLowercase = (password: string) => /(?=.*[a-z])/.test(password);
  const containsUppercase = (password: string) => /(?=.*[A-Z])/.test(password);
  const containsNumber = (password: string) => /(?=.*[0-9])/.test(password);
  const containsSpecial = (password: string) => /(?=.*\W)/.test(password);
</script>

<div class="card p-4 variant-filled" data-popup="popupFocusBlur">
  <p><strong>Password recommendations:</strong></p>
  <br />

  <ul>
    <li
      class={password.length === 0
        ? ""
        : isLengthValid(password)
        ? "text-green-400 dark:text-green-700"
        : "text-red-400 dark:text-red-700"}
    >
      <span class="text-sm"
        >{password.length === 0 || !isLengthValid(password) ? "❌" : "🟢"}
      </span>
      Minimum 8, maximum 64 characters long
    </li>

    <li
      class={password.length === 0
        ? ""
        : containsLowercase(password)
        ? "text-green-400 dark:text-green-700"
        : "text-red-400 dark:text-red-700"}
    >
      <span class="text-sm"
        >{password.length === 0 || !containsLowercase(password) ? "❌" : "🟢"}
      </span>
      Minimum 1 lowercase letter (a-z)
    </li>

    <li
      class={password.length === 0
        ? ""
        : containsUppercase(password)
        ? "text-green-400 dark:text-green-700"
        : "text-red-400 dark:text-red-700"}
    >
      <span class="text-sm"
        >{password.length === 0 || !containsUppercase(password) ? "❌" : "🟢"}
      </span>
      Minimum 1 uppercase letter (A-Z)
    </li>

    <li
      class={password.length === 0
        ? ""
        : containsNumber(password)
        ? "text-green-400 dark:text-green-700"
        : "text-red-400 dark:text-red-700"}
    >
      <span class="text-sm"
        >{password.length === 0 || !containsNumber(password) ? "❌" : "🟢"}
      </span>
      Minimum 1 number (0-9)
    </li>

    <li
      class={password.length === 0
        ? ""
        : containsSpecial(password)
        ? "text-green-400 dark:text-green-700"
        : "text-red-400 dark:text-red-700"}
    >
      <span class="text-sm"
        >{password.length === 0 || !containsSpecial(password) ? "❌" : "🟢"}
      </span>
      Minimum 1 special character (!@#$...)
    </li>
  </ul>

  <div class="arrow variant-filled" />
</div>
