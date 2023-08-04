<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    LightSwitch,
    SlideToggle,
  } from "@skeletonlabs/skeleton";
  import { popup } from "@skeletonlabs/skeleton";
  import { passwordPopupFocusBlur } from "components/PasswordStrengthMeter/helpers.js";
  import type { PageData } from "./$types";
  import Minidenticon from "components/Minidenticon.svelte";
  import { pageTitle } from "$lib/stores/pageTitle";
  import FormError from "components/FormError.svelte";
  import PasswordStrengthMeter from "components/PasswordStrengthMeter/PasswordStrengthMeter.svelte";
  import Fa from "svelte-fa";
  import {
    faChartSimple,
    faEnvelope,
    faEye,
    faEyeSlash,
    faIdBadge,
    faKey,
    faTrash,
  } from "@fortawesome/free-solid-svg-icons";
  import { superForm } from "sveltekit-superforms/client";
  import PasswordPopup from "components/PasswordPopup.svelte";
  import FormSuccess from "components/FormSuccess.svelte";
  import { canGoBack } from "$lib/stores/canGoBack";
  import { CHATTER_PAGE, currentPage } from "$lib/stores/currentPage";
  import { getCookie, setCookie } from "$lib/functions/helper";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { DO_NOT_TRACK_COOKIE_NAME } from "$lib/constants";

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

  let analyticsEnabled = false;
  let daCurrentPwVisible = false;
  let ceCurrentPwVisible = false;
  let cpCurrentPwVisible = false;
  let cpNewPwVisible = false;

  const toggleAnalytics = () => {
    if (!browser) {
      console.error("Not a browser. Cannot save settings");

      return;
    }

    setCookie(
      DO_NOT_TRACK_COOKIE_NAME,
      analyticsEnabled ? "false" : "true",
      365
    );

    console.info(`${analyticsEnabled ? "Enabled" : "Disabled"} analytics`);
  };

  const handleCECurrentPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $ceForm.password = target.value;
  };

  const handleCPCurrentPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $cpForm.currentPassword = target.value;
  };

  const handleCPNewPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $cpForm.password = target.value;
  };

  const handleDACurrentPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $daForm.password = target.value;
  };

  onMount(() => {
    const cookieVal = getCookie(DO_NOT_TRACK_COOKIE_NAME);
    analyticsEnabled = cookieVal === "false" || cookieVal === "" ? true : false;
  });
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
            data-umami-event="Change name button"
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

            <div class="input-group input-group-divider grid-cols-[1fr_auto]">
              <input
                name="password"
                class="input"
                type={ceCurrentPwVisible ? "text" : "password"}
                placeholder="current password"
                disabled={$ceDelayed}
                value={$ceForm.password}
                on:input={handleCECurrentPasswordInput}
                {...$ceConstraints.password}
              />

              <button
                on:click={(e) => {
                  e.preventDefault();
                  ceCurrentPwVisible = !ceCurrentPwVisible;
                }}
                type="button"
                class="flex items-center justify-center"
              >
                <Fa fw icon={ceCurrentPwVisible ? faEye : faEyeSlash} />
              </button>
            </div>

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
            data-umami-event="Change email button"
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

            <div class="input-group input-group-divider grid-cols-[1fr_auto]">
              <input
                name="currentPassword"
                class="input"
                type={cpCurrentPwVisible ? "text" : "password"}
                placeholder="current password"
                disabled={$cpDelayed}
                value={$cpForm.currentPassword}
                on:input={handleCPCurrentPasswordInput}
                {...$cpConstraints.currentPassword}
              />

              <button
                on:click={(e) => {
                  e.preventDefault();
                  cpCurrentPwVisible = !cpCurrentPwVisible;
                }}
                type="button"
                class="flex items-center justify-center"
              >
                <Fa fw icon={cpCurrentPwVisible ? faEye : faEyeSlash} />
              </button>
            </div>

            {#if $cpErrors.currentPassword}
              <FormError error={$cpErrors.currentPassword} />
            {/if}
          </label>

          <PasswordPopup password={$cpForm.password} />

          <label class="label">
            <span>New password</span>

            <div class="input-group input-group-divider grid-cols-[1fr_auto]">
              <input
                name="password"
                class="input"
                type={cpNewPwVisible ? "text" : "password"}
                placeholder="new password"
                disabled={$cpDelayed}
                value={$cpForm.password}
                use:popup={passwordPopupFocusBlur}
                on:input={handleCPNewPasswordInput}
                {...$cpConstraints.password}
              />

              <button
                on:click={(e) => {
                  e.preventDefault();
                  cpNewPwVisible = !cpNewPwVisible;
                }}
                type="button"
                class="flex items-center justify-center"
              >
                <Fa fw icon={cpNewPwVisible ? faEye : faEyeSlash} />
              </button>
            </div>

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
            data-umami-event="Change password button"
          />
        </form>
      </svelte:fragment>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="lead">
        <Fa fw icon={faChartSimple} />
      </svelte:fragment>

      <svelte:fragment slot="summary">Analytics</svelte:fragment>

      <svelte:fragment slot="content">
        <p>
          <span class="text-orange-600 dark:text-orange-400"
            ><strong>WARNING: </strong></span
          >
          <!-- eslint-disable-next-line max-len -->
          This setting is stored in a cookie. When you sign out, clear the browser
          cookies, or block cookies it will be reset to its default state (<strong
            >Disabled</strong
          >)
        </p>

        <SlideToggle
          name="enabled"
          bind:checked={analyticsEnabled}
          on:change={toggleAnalytics}
          bgDark="bg-surface-400"
          class="my-3"
        >
          Enable analytics?
        </SlideToggle>

        <p>
          <strong>Please refresh the page after changing this option</strong>
        </p>
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
          <span class="text-orange-600 dark:text-orange-400"
            ><strong>WARNING: </strong></span
          >
          If you choose to delete your account, there is no going back! Enter your
          current password and type "<i>Delete</i>" (case sensitive) without the
          "quotes" in the <strong>Confirmation</strong> field to proceed.
        </p>

        <form use:daEnhance method="post" action="?/delete">
          <label class="label mb-3 mt-5">
            <span>Current password</span>

            <div class="input-group input-group-divider grid-cols-[1fr_auto]">
              <input
                name="password"
                class="input"
                type={daCurrentPwVisible ? "text" : "password"}
                placeholder="current password"
                disabled={$daDelayed}
                value={$daForm.password}
                on:input={handleDACurrentPasswordInput}
                {...$daConstraints.password}
              />

              <button
                on:click={(e) => {
                  e.preventDefault();
                  daCurrentPwVisible = !daCurrentPwVisible;
                }}
                type="button"
                class="flex items-center justify-center"
              >
                <Fa fw icon={daCurrentPwVisible ? faEye : faEyeSlash} />
              </button>
            </div>

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
            data-umami-event="Delete account button"
          />
        </form>
      </svelte:fragment>
    </AccordionItem>
  </Accordion>

  <div class="w-full flex items-center justify-center md:hidden mt-5">
    <LightSwitch bgDark="bg-surface-400" />
  </div>

  <!-- eslint-disable max-len -->
  <div
    class="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-10 py-2 px-5 bg-surface-200 dark:bg-surface-200 rounded-lg"
  >
    <!-- eslint-enable max-len -->
    <a
      href="/privacy"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
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
      data-umami-event="View source code anchor"
    >
      Source Code
    </a>
  </div>
</main>
