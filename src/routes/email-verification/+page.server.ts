import {
  redirect, type Actions, error,
} from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { auth, generateEmailVerificationToken } from "$lib/server/lucia";
import { sendEmailVerificationEmail } from "$lib/server/mailer";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { emailVerificationLimiter } from "$lib/server/limiter";

export const load: PageServerLoad = async event => {
  emailVerificationLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  if (!session) throw redirect(302, "/login");

  if (!EMAIL_VERIFICATION) {
    throw redirect(302, "/login");
  }

  if (session.user.verified) {
    throw redirect(302, "/app/profile");
  }

  try {
    const token = await generateEmailVerificationToken(session.user.userId);

    console.log("Issued new email verification token");

    const emailVerificationResult = await sendEmailVerificationEmail(session.user.email, token);

    if (!emailVerificationResult) {
      return fail(500, { error: "Failed to send verification email" });
    }

    console.log("Sent email verification token");
  } catch (e) {
    console.error(e);

    throw error(500, "An error occurred while sending the email verification email.");
  }

  return { user: session.user };
};

export const actions: Actions = {
  default: async event => {
    if (await emailVerificationLimiter.isLimited(event)) throw error(429, "Too many requests");

    const { locals } = event;

    const session = await locals.auth.validate();

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId);

    locals.auth.setSession(null);
  },
};
