<script lang="ts">
  import { enhance } from "$app/forms";
  import {
    modalStore,
    type ModalSettings,
    toastStore,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";

  export let data: PageData;

  const evaluateResponse = (response: string) => {
    if (response !== "delete") {
      toastStore.trigger({
        message: "Aborted account deletion",
        background: "variant-filled-warning",
      });

      return;
    }

    const container = document.getElementById("delete-form");

    if (!container) return;

    const deleteAccountButton = document.createElement("input");

    deleteAccountButton.type = "submit";
    deleteAccountButton.value = "Deleting account...";
    deleteAccountButton.style.visibility = "none";
    deleteAccountButton.classList.add("mt-5", "text-red-400");

    container.appendChild(deleteAccountButton);

    deleteAccountButton.click();
  };

  const modal: ModalSettings = {
    type: "prompt",
    title: "Delete Account",
    body: 'If you are sure you would like to delete your account, please type "delete" below.',
    buttonTextConfirm: "Delete account",
    valueAttr: { type: "text", minlength: 1, maxlength: 6, required: true },
    response: evaluateResponse,
  };

  const showPrompt = () => modalStore.trigger(modal);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | Profile</title>
</svelte:head>

<main class="container sm mx-auto my-auto p-5 text-center" id="profile-cont">
  <h1 class="h1">Profile</h1>

  <br />

  <div>
    <h2 class="h2">{data.user.name}</h2>
    <p>{data.user.email}</p>
  </div>

  <form use:enhance method="post" action="?/signOut">
    <input
      type="submit"
      value="Sign out"
      class="btn variant-filled-primary mt-5"
    />
  </form>

  <button
    aria-label="Delete account"
    class="btn variant-filled-error mt-5"
    on:click={showPrompt}
  >
    Delete account
  </button>

  <form use:enhance method="post" action="?/delete" id="delete-form" />
</main>
