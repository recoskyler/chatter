import {
  error, redirect, type Actions, fail,
} from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { auth } from "$lib/server/lucia";
import {
  DO_NOT_TRACK_COOKIE_NAME,
  DISCLAIMER_DISMISSED_COOKIE_NAME,
  EMAIL_VERIFICATION,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_EMAIL_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "$lib/constants";
import { z } from "zod";
import {
  message, setError, superValidate,
} from "sveltekit-superforms/server";
import { LuciaError } from "lucia";
import { db } from "$lib/server/drizzle";
import {
  account, chat, prompt, user, userConfig,
} from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { profileUpdateLimiter } from "$lib/server/limiter";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

const changeEmailSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  email: z.string().email().min(MIN_EMAIL_LENGTH).max(MAX_EMAIL_LENGTH),
});

const deleteAccountSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  confirmation: z.string().min(1).max(16),
});

const changeNameSchema = z.object({ name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH) });

export const actions: Actions = {
  signOut: async ({ locals, cookies }) => {
    const session = await locals.auth.validate();

    cookies.delete(DO_NOT_TRACK_COOKIE_NAME);
    cookies.delete(DISCLAIMER_DISMISSED_COOKIE_NAME);

    locals.auth.setSession(null); // remove cookie

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId); // invalidate session
  },
  delete: async ({ locals, request }) => {
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const form = await superValidate(request, deleteAccountSchema);

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { deleteAccountForm: form });
    }

    if (form.data.confirmation !== "Delete") {
      return setError(form, "", "You must type \"Delete\" without the \"quotes\" in the confirmation field.");
    }

    try {
      await auth.useKey("email", session.user.email, form.data.password);

      await db.delete(userConfig).where(eq(userConfig.userId, session.user.userId));
      await db.delete(account).where(eq(account.userId, session.user.userId));

      const chats = await db.query.chat.findMany({ where: eq(chat.userId, session.user.userId) });

      if (chats) {
        for (const c of chats) {
          await db.delete(prompt).where(eq(prompt.chatId, c.id));
        }

        await db.delete(chat).where(eq(chat.userId, session.user.userId));
      }

      await auth.deleteUser(session.user.userId);
      await auth.invalidateSession(session.sessionId);
    } catch (e) {
      if (e instanceof LuciaError && e.message === "AUTH_INVALID_PASSWORD") {
        return setError(form, "", "Invalid current password");
      }

      return fail(500, { error: "Failed to delete account" });
    }

    locals.auth.setSession(null);

    return message(form, "Account deleted successfully");
  },
  changePassword: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const form = await superValidate(request, changePasswordSchema);

    if (await profileUpdateLimiter.isLimited(event)) {
      return setError(
        form,
        "",
        "You are doing this too fast. Please wait a few minutes.",
      );
    }

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { changePasswordForm: form });
    }

    if (form.data.currentPassword === form.data.password) {
      return setError(form, "", "New password cannot be the same as the current password");
    }

    try {
      await auth.useKey("email", session.user.email, form.data.currentPassword);
      await auth.invalidateAllUserSessions(session.user.userId);
      await auth.updateKeyPassword("email", session.user.email, form.data.password);

      const newSession = await auth.createSession({ userId: session.user.userId, attributes: {} });

      locals.auth.setSession(newSession);
    } catch (e) {
      if (e instanceof LuciaError && e.message === "AUTH_INVALID_PASSWORD") {
        return setError(form, "", "Invalid current password");
      }

      console.error("Unable to change password");
      console.error(e);

      return setError(form, "", "Unable to change password");
    }

    return message(form, "Password changed successfully");
  },
  changeEmail: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const form = await superValidate(request, changeEmailSchema);

    if (await profileUpdateLimiter.isLimited(event)) {
      return setError(
        form,
        "",
        "You are doing this too fast. Please wait a few minutes.",
      );
    }

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { changeEmailForm: form });
    }

    if (form.data.email.trim() === session.user.email) {
      return setError(form, "", "New email cannot be the same as the current email");
    }

    try {
      await auth.useKey("email", session.user.email, form.data.password);
      await auth.invalidateAllUserSessions(session.user.userId);
      await auth.createKey({
        providerId: "email",
        providerUserId: form.data.email.trim(),
        userId: session.user.userId,
        password: form.data.password,
      });
      await auth.deleteKey("email", session.user.email);
      await auth.updateUserAttributes(session.user.userId, { email: form.data.email.trim() });

      const newSession = await auth.createSession({ userId: session.user.userId, attributes: {} });

      locals.auth.setSession(newSession);
    } catch (e) {
      if (e instanceof LuciaError && e.message === "AUTH_INVALID_PASSWORD") {
        return setError(form, "", "Invalid current password");
      }

      console.error("Unable to change email");
      console.error(e);

      return setError(form, "", "Unable to change email");
    }

    return message(form, "Email changed successfully");
  },
  changeName: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const form = await superValidate(request, changeNameSchema);

    if (await profileUpdateLimiter.isLimited(event)) {
      return setError(
        form,
        "",
        "You are doing this too fast. Please wait a few minutes.",
      );
    }

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { changeNameForm: form });
    }

    if (form.data.name.trim() === session.user.name) {
      return setError(form, "", "New name cannot be the same as the current name");
    }

    console.log("Changing name...");

    try {
      await auth.updateUserAttributes(session.user.userId, { name: form.data.name.trim() });
    } catch (e) {
      console.error("Unable to change name");
      console.error(e);

      return setError(form, "", "Unable to change name");
    }

    return message(form, "Name changed successfully");
  },
};

export const load: PageServerLoad = async event => {
  profileUpdateLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  if (!session) throw redirect(302, "/login");

  if (EMAIL_VERIFICATION && !session.user.verified) {
    throw redirect(302, "/email-verification");
  }

  const dbUser = await db.query.user.findFirst({
    with: { config: true },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  if (dbUser.config === null) throw redirect(302, "/app/setup");

  const changePasswordForm = await superValidate(changePasswordSchema);
  const changeEmailForm = await superValidate(changeEmailSchema);
  const changeNameForm = await superValidate(changeNameSchema);
  const deleteAccountForm = await superValidate(deleteAccountSchema);

  return {
    user: session.user,
    changePasswordForm,
    changeEmailForm,
    deleteAccountForm,
    changeNameForm,
  };
};
