import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { auth, emailVerificationToken } from "$lib/server/lucia";
import { EMAIL_VERIFICATION } from "$env/static/private";
import { LuciaTokenError } from "@lucia-auth/tokens";
import { sendEmailVerificationEmail } from "$lib/server/mailer";

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.auth.validateUser();
  const { session } = await locals.auth.validateUser();

  if (!user || !session) throw redirect(302, "/login");

  const emailVerificationEnabled = EMAIL_VERIFICATION === "true";

  if (user && emailVerificationEnabled && user.emailVerified) {
    throw redirect(302, "/profile");
  }

  let allExpired = true;

  try {
    const tokens = await emailVerificationToken.getUserTokens(user.userId);

    for (let i = 0; i < tokens.length; ++i) {
      const token = tokens[i];

      if (!token.expired) {
        allExpired = false;
        break;
      }
    }

    if (allExpired) {
      const token = await emailVerificationToken.issue(user.userId);

      console.log("Issued new email verification token");

      const emailVerificationResult = await sendEmailVerificationEmail(
        user.email, token.toString(),
      );

      if (!emailVerificationResult) {
        return fail(500, { error: "Failed to send verification email" });
      }

      console.log("Sent email verification token");
    }
  } catch (e) {
    if (e instanceof LuciaTokenError && e.message === "INVALID_USER_ID") {
      console.error("Invalid user ID");

      const { session } = await locals.auth.validateUser();

      if (!session) return fail(401);

      await auth.invalidateSession(session.sessionId); // invalidate session

      locals.auth.setSession(null); // remove cookie

      throw redirect(302, "/profile");
    }

    console.error(e);
  }

  return { user };
};

export const actions: Actions = {
  default: async ({ locals }) => {
    const { session } = await locals.auth.validateUser();

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId); // invalidate session

    locals.auth.setSession(null); // remove cookie
  },
};