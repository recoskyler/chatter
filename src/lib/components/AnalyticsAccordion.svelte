<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    LightSwitch,
    SlideToggle,
  } from "@skeletonlabs/skeleton";
  import { popup } from "@skeletonlabs/skeleton";
  import { passwordPopupFocusBlur } from "components/PasswordStrengthMeter/helpers.js";
  import type { PageData } from "../../routes/app/profile/$types";
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

