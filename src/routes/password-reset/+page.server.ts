import prisma from "$lib/prisma";
import { auth, passwordResetToken } from "$lib/server/lucia";
import { sendPasswordResetEmail } from "$lib/server/mailer";
import {
  fail, type Actions, error, redirect,
} from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { EMAIL_VERIFICATION } from "$env/static/private";
import { isEmailValid } from "$lib/functions/validators";

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.auth.validateUser();
  const emailVerificationEnabled = EMAIL_VERIFICATION === "true";

  if (user && emailVerificationEnabled && !user.emailVerified) {
    throw redirect(302, "/email-verification");
  }

  if (user) {
    throw redirect(302, "/profile");
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
    try {
      const form = await request.formData();
      const email = form.get("email");

      if (typeof email !== "string" || !isEmailValid(email)) {
        console.error("Invalid email");
        return fail(400, { error: "Invalid email}" });
      }

      const databaseUser = await prisma.authUser.findFirst(
        { where: { email: email, emailVerified: true } },
      );

      if (!databaseUser) {
        return { success: true };
      }

      const user = auth.transformDatabaseUser(databaseUser);
      const token = await passwordResetToken.issue(user.userId);

      console.log("Issued new password reset token");

      const passwordResetResult = await sendPasswordResetEmail(user.email, token.toString());

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
