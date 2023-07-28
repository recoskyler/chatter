import { auth, validateToken } from "$lib/server/lucia";
import {
  fail, type Actions, error, redirect,
} from "@sveltejs/kit";
import { passwordResetLimiter } from "$lib/server/limiter";
import type { PageServerLoad } from "./$types";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "$lib/constants";

export const load: PageServerLoad = event => {
  passwordResetLimiter.cookieLimiter?.preflight(event);
};

export const actions: Actions = {
  default: async event => {
    if (await passwordResetLimiter.isLimited(event)) throw error(429, "Too many requests");

    const { request, locals, params } = event;

    try {
      const form = await request.formData();
      const password = form.get("password");
      const userId = await validateToken(params.token ?? "");
      const user = await auth.getUser(userId);

      if (
        typeof password !== "string"
        || password.length < MIN_PASSWORD_LENGTH
        || password.length > MAX_PASSWORD_LENGTH
      ) {
        console.error("Invalid password");

        return fail(400, { error: "Invalid password" });
      }

      await auth.invalidateAllUserSessions(user.userId);
      await auth.updateKeyPassword("email", user.email, password);

      const session = await auth.createSession({ userId: userId, attributes: {} });

      locals.auth.setSession(session);

      console.log("Changed password successfully");
    } catch (e) {
      console.error(e);

      throw error(401, "Invalid or expired token");
    }

    throw redirect(302, "/app/profile");
  },
};
