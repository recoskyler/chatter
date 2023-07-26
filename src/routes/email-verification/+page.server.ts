import {
  redirect, type Actions, error,
} from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { auth, emailVerificationToken } from "$lib/server/lucia";
import { LuciaTokenError } from "@lucia-auth/tokens";
import { sendEmailVerificationEmail } from "$lib/server/mailer";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { emailVerificationLimiter } from "$lib/server/limiter";

export const load: PageServerLoad = async event => {
  emailVerificationLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const { user, session } = await locals.auth.validateUser();

  if (!user || !session) throw redirect(302, "/login");

  if (!EMAIL_VERIFICATION) {
    throw redirect(302, "/login");
  }

  if (user && user.verified) {
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
  default: async event => {
    if (await emailVerificationLimiter.isLimited(event)) throw error(429, "Too many requests");

    const { locals } = event;

    const { session } = await locals.auth.validateUser();

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId); // invalidate session

    locals.auth.setSession(null); // remove cookie
  },
};
