import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { type Actions, fail } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import { EMAIL_VERIFICATION } from "$lib/constants";

export const actions: Actions = {
  logout: async ({ locals }) => {
    const { session } = await locals.auth.validateUser();

    if (!session) return fail(401);

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
