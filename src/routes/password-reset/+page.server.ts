import { generatePasswordResetToken } from "$lib/server/lucia";
import { sendPasswordResetEmail } from "$lib/server/mailer";
import {
  fail, type Actions, error, redirect,
} from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { isEmailValid } from "$lib/functions/validators";
import { db } from "$lib/server/drizzle";
import { eq } from "drizzle-orm";
import { user } from "$lib/db/schema";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { passwordResetLimiter } from "$lib/server/limiter";

export const load: PageServerLoad = async event => {
  passwordResetLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  if (!session) return;

  const dbUser = await db.query.user.findFirst({ where: eq(user.id, session.userId) });

  if (!dbUser) throw error(404, "User not found");

  if (dbUser && EMAIL_VERIFICATION && !dbUser.verified) {
    throw redirect(302, "/email-verification");
  }

  throw redirect(302, "/app/profile");
};

export const actions: Actions = {
  default: async event => {
    if (await passwordResetLimiter.isLimited(event)) throw error(429, "Too many requests");

    const { request } = event;

    try {
      const form = await request.formData();
      const email = form.get("email");

      if (typeof email !== "string" || !isEmailValid(email)) {
        console.error("Invalid email");
        return fail(400, { error: "Invalid email}" });
      }

      const dbUser = await db.query.user.findFirst({ where: eq(user.email, email) });

      if (!dbUser) return { success: true };

      const token = await generatePasswordResetToken(dbUser.id);

      console.log("Issued new password reset token");

      const passwordResetResult = await sendPasswordResetEmail(dbUser.email, token.toString());

      if (!passwordResetResult) {
        return fail(500, { error: "Failed to send password reset email" });
      }

      console.log("Sent password reset token");
    } catch {
      throw error(500, "Failed to send password reset email");
    }

    return { success: true };
  },
};
