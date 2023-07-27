<script lang="ts">
  import {
    modalStore,
    type ModalSettings,
    toastStore,
    Accordion,
    AccordionItem,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import Minidenticon from "components/Minidenticon.svelte";
  import { pageTitle } from "writables/pageTitle";
  import FormError from "components/FormError.svelte";
  import PasswordStrengthMeter from "components/PasswordStrengthMeter/PasswordStrengthMeter.svelte";
  import { isPasswordValid } from "$lib/functions/validators";
  import Fa from "svelte-fa";
  import { faKey, faTrash } from "@fortawesome/free-solid-svg-icons";
  import { superForm } from "sveltekit-superforms/client";

  export let data: PageData;

  const { form, errors, constraints, enhance, delayed } = superForm(data.form);

  let password = "";

  $pageTitle = "Profile";

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

<main
  class="flex flex-col mx-auto my-auto p-5 max-w-md auto-cols-min"
  id="profile-cont"
>
  <div class="flex flex-row gap-5">
    <div class="flex justify-center items-center">
      <Minidenticon email={data.user.email} size={4} />
    </div>

    <div class="flex flex-col items-start gap-2">
      <h4 class="h4"><strong>{data.user.name}</strong></h4>
      <p>{data.user.email}</p>
    </div>
  </div>

  <form method="post" action="?/signOut" class="w-full mt-5">
    <input
      type="submit"
      value="Sign out"
      class="btn variant-filled-primary mt-5 w-full"
    />
  </form>

  <Accordion class="mt-10">
    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa icon={faKey} />
      </svelte:fragment>

      <svelte:fragment slot="summary">Change password</svelte:fragment>

      <svelte:fragment slot="content">
        <form use:enhance action="?/changePassword" method="post">
          <label class="label mb-3 mt-5">
            <span>Current password</span>

            <input
              name="currentPassword"
              class="input"
              type="password"
              placeholder="current password"
              bind:value={$form.currentPassword}
              {...$constraints.currentPassword}
            />

            {#if $errors.currentPassword}
              <FormError error={$errors.currentPassword} />
            {/if}
          </label>

          <label class="label">
            <span>New password</span>

            <input
              name="password"
              class="input"
              type="password"
              placeholder="new password"
              bind:value={$form.password}
              {...$constraints.password}
            />

            {#if $errors.password}
              <FormError error={$errors.password} />
            {/if}
          </label>

          <PasswordStrengthMeter password={$form.password} />

          {#if $errors._errors}
            <FormError error={$errors._errors} />
          {/if}

          <input
            type="submit"
            value="Change password"
            class="btn mt-3 w-full variant-filled"
          />
        </form>
      </svelte:fragment>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa icon={faTrash} class="text-red-400" />
      </svelte:fragment>

      <svelte:fragment slot="summary">
        <span class="text-red-400">Delete account</span>
      </svelte:fragment>

      <svelte:fragment slot="content">
        <p>
          <span class="text-orange-400"><strong>WARNING: </strong></span>
          If you choose to delete your account, there is no going back! You will
          be asked for confirmation before you can delete your account.
        </p>

        <button
          aria-label="Delete account"
          class="btn variant-filled-error mt-5 w-full"
          on:click={showPrompt}
        >
          Delete account
        </button>
      </svelte:fragment>
    </AccordionItem>
    <!-- ... -->
  </Accordion>

  <form method="post" action="?/delete" id="delete-form" />
</main>
