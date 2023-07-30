import { generatePasswordResetToken } from "$lib/server/lucia";
import { sendPasswordResetEmail } from "$lib/server/mailer";
import {
  fail, type Actions, error, redirect,
} from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle";
import { eq } from "drizzle-orm";
import { user } from "$lib/db/schema";
import {
  EMAIL_VERIFICATION, MAX_EMAIL_LENGTH, MIN_EMAIL_LENGTH,
} from "$lib/constants";
import { passwordResetLimiter } from "$lib/server/limiter";
import { z } from "zod";
import {
  message, setError, superValidate,
} from "sveltekit-superforms/server";

const passwordResetSchema = z.object(
  { email: z.string().email().min(MIN_EMAIL_LENGTH).max(MAX_EMAIL_LENGTH) },
);

export const load: PageServerLoad = async event => {
  passwordResetLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();
  const form = await superValidate(passwordResetSchema);

  if (!session) return { form };

  const dbUser = await db.query.user.findFirst({ where: eq(user.id, session.user.userId) });

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

    const form = await superValidate(request, passwordResetSchema);

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    try {
      const dbUser = await db.query.user.findFirst({ where: eq(user.email, form.data.email) });

      if (!dbUser) {
        return message(
          form,
          "A password reset email has been sent to the email if an account with that email exists.",
        );
      }

      const token = await generatePasswordResetToken(dbUser.id);

      console.log("Issued new password reset token");

      const passwordResetResult = await sendPasswordResetEmail(dbUser.email, token.toString());

      if (!passwordResetResult) {
        return setError(
          form,
          "",
          "Failed to send email.",
        );
      }

      console.log("Sent password reset token");
    } catch {
      return setError(
        form,
        "",
        "Failed to send email.",
      );
    }

    return message(
      form,
      "A password reset email has been sent to the email if an account with that email exists.",
    );
  },
};
