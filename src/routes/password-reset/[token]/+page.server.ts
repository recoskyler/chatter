import { LuciaTokenError } from "@lucia-auth/tokens";
import { auth, passwordResetToken } from "$lib/server/lucia";
import {
  fail, type Actions, error, redirect,
} from "@sveltejs/kit";
import { passwordResetLimiter } from "$lib/server/limiter";
import type { PageServerLoad } from "./$types";

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
      const token = await passwordResetToken.validate(params.token ?? "");
      const user = await auth.getUser(token.userId);

      if (typeof password !== "string" || password.length < 8) {
        console.error("Invalid password");

        return fail(400, { error: "Invalid password" });
      }

      await auth.invalidateAllUserSessions(user.userId);
      await auth.updateKeyPassword("email", user.email, password);

      const session = await auth.createSession(user.userId);

      locals.auth.setSession(session);

      console.log("Changed password successfully");
    } catch (e) {
      if (e instanceof LuciaTokenError && e.message === "EXPIRED_TOKEN") {
        throw error(401, "Expired token");
      }

      if (e instanceof LuciaTokenError && e.message === "INVALID_TOKEN") {
        throw error(498, "Invalid token");
      }

      console.error(e);

      throw error(500, "Failed to reset password");
    }

    throw redirect(302, "/app/profile");
  },
};
