<script lang="ts">
  import mail from "images/undraw_mail_sent_re_0ofv.svg";
</script>

<svelte:head>
  <title>Chatter | Email verification</title>
</svelte:head>

<div class="flex text-center mx-auto my-auto flex-col items-center justify-center gap-2">
  <img class="max-w-xs mb-5" src={mail} alt="Email verified">
  <h1 class="h1">Email verified</h1>
  <br />
  <p>Hooray! Your email has been verified.</p>
  <br />
  <a href="/app/profile" class="btn variant-filled">Continue</a>
</div>
