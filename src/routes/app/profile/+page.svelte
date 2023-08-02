<script lang="ts">
  import { Accordion, AccordionItem, LightSwitch } from "@skeletonlabs/skeleton";
  import { popup } from "@skeletonlabs/skeleton";
  import { passwordPopupFocusBlur } from "components/PasswordStrengthMeter/helpers.js";
  import type { PageData } from "./$types";
  import Minidenticon from "components/Minidenticon.svelte";
  import { pageTitle } from "$lib/stores/pageTitle";
  import FormError from "components/FormError.svelte";
  import PasswordStrengthMeter from "components/PasswordStrengthMeter/PasswordStrengthMeter.svelte";
  import Fa from "svelte-fa";
  import {
    faEnvelope,
    faIdBadge,
    faKey,
    faTrash,
  } from "@fortawesome/free-solid-svg-icons";
  import { superForm } from "sveltekit-superforms/client";
  import PasswordPopup from "components/PasswordPopup.svelte";
  import FormSuccess from "components/FormSuccess.svelte";
  import { canGoBack } from "$lib/stores/canGoBack";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";

  export let data: PageData;

  const {
    form: cpForm,
    errors: cpErrors,
    constraints: cpConstraints,
    enhance: cpEnhance,
    message: cpMessage,
    delayed: cpDelayed,
  } = superForm(data.changePasswordForm);

  const {
    form: ceForm,
    errors: ceErrors,
    constraints: ceConstraints,
    enhance: ceEnhance,
    message: ceMessage,
    delayed: ceDelayed,
  } = superForm(data.changeEmailForm);

  const {
    form: daForm,
    errors: daErrors,
    constraints: daConstraints,
    enhance: daEnhance,
    message: daMessage,
    delayed: daDelayed,
  } = superForm(data.deleteAccountForm);

  const {
    form: cnForm,
    errors: cnErrors,
    constraints: cnConstraints,
    enhance: cnEnhance,
    message: cnMessage,
    delayed: cnDelayed,
  } = superForm(data.changeNameForm);

  $pageTitle = "Profile";
  $currentPage = CHATTER_PAGE.PROFILE;
  $canGoBack = null;
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Chatter | Profile</title>
</svelte:head>

<main
  class=" h-full flex flex-col mx-auto my-auto p-5 max-w-md auto-cols-min"
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

  <Accordion class="mt-10" autocollapse>
    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faIdBadge} />
      </svelte:fragment>

      <svelte:fragment slot="summary">Change name</svelte:fragment>

      <svelte:fragment slot="content">
        <form use:cnEnhance action="?/changeName" method="post">
          <label class="label">
            <span>New name</span>

            <input
              name="name"
              class="input"
              type="text"
              placeholder="John Doe"
              disabled={$cnDelayed}
              bind:value={$cnForm.name}
              {...$cnConstraints.name}
            />

            {#if $cnErrors.name}
              <FormError error={$cnErrors.name} />
            {/if}
          </label>

          {#if $cnErrors._errors}
            <FormError error={$cnErrors._errors} />
          {/if}

          {#if $cnMessage}
            <FormSuccess message={$cnMessage} />
          {/if}

          <input
            type="submit"
            value={$cnDelayed ? "Saving..." : "Change name"}
            class={`btn mt-5 w-full ${
              $cnDelayed ? "variant-filled-surface" : "variant-filled"
            }`}
            disabled={$cnDelayed}
          />
        </form>
      </svelte:fragment>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faEnvelope} />
      </svelte:fragment>

      <svelte:fragment slot="summary">Change email</svelte:fragment>

      <svelte:fragment slot="content">
        <form use:ceEnhance action="?/changeEmail" method="post">
          <label class="label mb-3 mt-5">
            <span>Current password</span>

            <input
              name="password"
              class="input"
              type="password"
              placeholder="current password"
              disabled={$ceDelayed}
              bind:value={$ceForm.password}
              {...$ceConstraints.password}
            />

            {#if $ceErrors.password}
              <FormError error={$ceErrors.password} />
            {/if}
          </label>

          <label class="label">
            <span>New email</span>

            <input
              name="email"
              class="input"
              type="email"
              placeholder="john@example.com"
              disabled={$ceDelayed}
              bind:value={$ceForm.email}
              {...$ceConstraints.email}
            />

            {#if $ceErrors.email}
              <FormError error={$ceErrors.email} />
            {/if}
          </label>

          {#if $ceErrors._errors}
            <FormError error={$ceErrors._errors} />
          {/if}

          {#if $ceMessage}
            <FormSuccess message={$ceMessage} />
          {/if}

          <input
            type="submit"
            value={$ceDelayed ? "Saving..." : "Change email"}
            class={`btn mt-5 w-full ${
              $ceDelayed ? "variant-filled-surface" : "variant-filled"
            }`}
            disabled={$ceDelayed}
          />
        </form>
      </svelte:fragment>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faKey} />
      </svelte:fragment>

      <svelte:fragment slot="summary">Change password</svelte:fragment>

      <svelte:fragment slot="content">
        <form use:cpEnhance action="?/changePassword" method="post">
          <label class="label mb-3 mt-5">
            <span>Current password</span>

            <input
              name="currentPassword"
              class="input"
              type="password"
              placeholder="current password"
              disabled={$cpDelayed}
              bind:value={$cpForm.currentPassword}
              {...$cpConstraints.currentPassword}
            />

            {#if $cpErrors.currentPassword}
              <FormError error={$cpErrors.currentPassword} />
            {/if}
          </label>

          <PasswordPopup password={$cpForm.password} />

          <label class="label">
            <span>New password</span>

            <input
              name="password"
              class="input"
              type="password"
              placeholder="new password"
              disabled={$cpDelayed}
              use:popup={passwordPopupFocusBlur}
              bind:value={$cpForm.password}
              {...$cpConstraints.password}
            />

            {#if $cpErrors.password}
              <FormError error={$cpErrors.password} />
            {/if}
          </label>

          <PasswordStrengthMeter password={$cpForm.password} />

          {#if $cpErrors._errors}
            <FormError error={$cpErrors._errors} />
          {/if}

          {#if $cpMessage}
            <FormSuccess message={$cpMessage} />
          {/if}

          <input
            type="submit"
            value={$cpDelayed ? "Saving..." : "Change password"}
            class={`btn mt-5 w-full ${
              $cpDelayed ? "variant-filled-surface" : "variant-filled"
            }`}
            disabled={$cpDelayed}
          />
        </form>
      </svelte:fragment>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faTrash} class="text-red-600 dark:text-red-400" />
      </svelte:fragment>

      <svelte:fragment slot="summary">
        <span class="text-red-600 dark:text-red-400">Delete account</span>
      </svelte:fragment>

      <svelte:fragment slot="content">
        <p>
          <span class="text-orange-600 dark:text-orange-400"><strong>WARNING: </strong></span>
          If you choose to delete your account, there is no going back! Enter your
          current password and type "<i>Delete</i>" (case sensitive) without the
          "quotes" in the <strong>Confirmation</strong> field to proceed.
        </p>

        <form use:daEnhance method="post" action="?/delete">
          <label class="label mb-3 mt-5">
            <span>Current password</span>

            <input
              name="password"
              class="input"
              type="password"
              placeholder="current password"
              disabled={$daDelayed}
              bind:value={$daForm.password}
              {...$daConstraints.password}
            />

            {#if $daErrors.password}
              <FormError error={$daErrors.password} />
            {/if}
          </label>

          <label class="label mb-3 mt-5">
            <span>Confirmation</span>

            <input
              name="confirmation"
              class="input"
              type="text"
              placeholder="Delete"
              disabled={$daDelayed}
              bind:value={$daForm.confirmation}
              {...$daConstraints.confirmation}
            />

            {#if $daErrors.confirmation}
              <FormError error={$daErrors.confirmation} />
            {/if}
          </label>

          {#if $daErrors._errors}
            <FormError error={$daErrors._errors} />
          {/if}

          {#if $daMessage}
            <FormSuccess message={$daMessage} />
          {/if}

          <input
            type="submit"
            value={$daDelayed ? "Exterminating..." : "Delete account"}
            class={`btn mt-5 w-full ${
              $daDelayed ? "variant-filled-surface" : "variant-filled-error"
            }`}
            disabled={$daDelayed}
          />
        </form>
      </svelte:fragment>
    </AccordionItem>
  </Accordion>

  <div class="w-full flex items-center justify-center md:hidden">
    <LightSwitch bgDark="bg-surface-400" />
  </div>

  <div class="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-10 py-2 px-5 bg-surface-200 dark:bg-surface-200 rounded-lg">
    <a href="/privacy" target="_blank" rel="noopener noreferrer" class="anchor text-center">
      Privacy Policy
    </a>

    <a
      href="/disclaimer"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      Disclaimer
    </a>

    <a
      href="/cookie"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      Cookie Policy
    </a>

    <a
      href="https://github.com/recoskyler/chatter/blob/main/LICENSE"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      License
    </a>

    <a
      href="https://github.com/recoskyler/chatter"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      Source Code
    </a>
  </div>
</main>
