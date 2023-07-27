import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { type Actions, fail } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import {
  EMAIL_VERIFICATION, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH,
} from "$lib/constants";
import { z } from "zod";
import { setError, superValidate } from "sveltekit-superforms/server";
import { LuciaError } from "lucia-auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const actions: Actions = {
  signOut: async ({ locals }) => {
    const { session } = await locals.auth.validateUser();

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId); // invalidate session

    locals.auth.setSession(null); // remove cookie
  },
  delete: async ({ locals }) => {
    const { session, user } = await locals.auth.validateUser();

    if (!session || !user) return fail(401);

    try {
      await auth.deleteUser(user.userId);
    } catch (error) {
      return fail(500, { error: "Failed to delete account" });
    }

    await auth.invalidateSession(session.sessionId); // invalidate session

    locals.auth.setSession(null); // remove cookie
  },
  changePassword: async ({ locals, request }) => {
    const { session, user } = await locals.auth.validateUser();

    if (!session || !user) return fail(401);

    const form = await superValidate(request, changePasswordSchema);

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    if (form.data.currentPassword === form.data.password) {
      return setError(form, "", "New password cannot be the same as the current password");
    }

    try {
      await auth.useKey("email", user.email, form.data.currentPassword);
      await auth.updateKeyPassword("email", user.email, form.data.password);
      await auth.invalidateAllUserSessions(user.userId);

      locals.auth.setSession(null);
    } catch (e) {
      if (e instanceof LuciaError && e.message === "AUTH_INVALID_PASSWORD") {
        return setError(form, "", "Invalid current password");
      }

      console.error("Unable to change password");
      console.error(e);

      return setError(form, "", "Unable to change password");
    }
  },
};

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.auth.validateUser();

  if (!user) throw redirect(302, "/login");

  if (user && EMAIL_VERIFICATION && !user.verified) {
    throw redirect(302, "/email-verification");
  }

  const form = await superValidate(changePasswordSchema);

  return { user, form };
};
