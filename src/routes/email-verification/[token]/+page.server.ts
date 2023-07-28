import { auth, validateToken } from "$lib/server/lucia";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { emailVerificationLimiter } from "$lib/server/limiter";

export const load: PageServerLoad = async event => {
  emailVerificationLimiter.cookieLimiter?.preflight(event);

  if (await emailVerificationLimiter.isLimited(event)) throw error(429, "Too many requests");

  const { locals, params } = event;

  if (!EMAIL_VERIFICATION) {
    throw error(405, "Email verification disabled");
  }

  const { token } = params;

  try {
    const userId = await validateToken(token);

    await auth.invalidateAllUserSessions(userId);
    await auth.updateUserAttributes(userId, { verified: true });

    const session = await auth.createSession({ userId, attributes: {} });

    locals.auth.setSession(session);
  } catch (e) {
    console.error(e);

    throw error(401, "Invalid or expired token");
  }
};
