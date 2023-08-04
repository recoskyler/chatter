<script lang="ts">
  import { enhance } from "$app/forms";
  import mailbox from "images/undraw_mailbox_re_dvds.svg";
</script>

<svelte:head>
  <title>Chatter | Email verification</title>
</svelte:head>

<div class="flex text-center mx-auto my-auto flex-col items-center justify-center gap-2 w-full px-5 py-10  max-w-md">
  <img class="max-w-xs mb-5" src={mailbox} alt="Mailbox">
  <h1 class="h1">Email verification</h1>
  <br />
  <p>Please check your inbox/spam folder for a verification link</p>
  <br />
  <form use:enhance method="post">
    <input type="submit" value="Sign out" class="btn variant-filled-primary" />
  </form>
</div>
