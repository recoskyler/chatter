import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { type Actions, fail } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import { EMAIL_VERIFICATION } from "$lib/constants";

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
};

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.auth.validateUser();

  if (!user) throw redirect(302, "/login");

  if (user && EMAIL_VERIFICATION && !user.verified) {
    throw redirect(302, "/email-verification");
  }

  return { user };
};
