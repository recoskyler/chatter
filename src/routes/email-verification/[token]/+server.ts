import { auth, emailVerificationToken } from "$lib/server/lucia";
import { LuciaTokenError } from "@lucia-auth/tokens";
import {
  error,
  redirect,
} from "@sveltejs/kit";

import type { RequestHandler } from "./$types";
import { EMAIL_VERIFICATION } from "$env/static/private";

export const GET: RequestHandler = async ({ params, locals }) => {
  if (EMAIL_VERIFICATION !== "true") {
    throw error(405, "Email verification disabled");
  }

  const tokenParams = params.token;

  try {
    const token = await emailVerificationToken.validate(tokenParams);

    await auth.invalidateAllUserSessions(token.userId);
    await auth.updateUserAttributes(token.userId, { verified: true });

    const session = await auth.createSession(token.userId);

    locals.auth.setSession(session);
  } catch (e) {
    if (e instanceof LuciaTokenError && e.message === "EXPIRED_TOKEN") {
      throw error(401, "Expired token");
    }

    if (e instanceof LuciaTokenError && e.message === "INVALID_TOKEN") {
      throw error(498, "Invalid token");
    }

    console.error(e);

    throw error(500, "An error occurred");
  }

  throw redirect(302, "/profile");
};
