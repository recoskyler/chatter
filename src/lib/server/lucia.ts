import lucia from "lucia-auth";
import { sveltekit } from "lucia-auth/middleware";
import prisma from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { dev } from "$app/environment";
import { idToken } from "@lucia-auth/tokens";
import { EMAIL_VERIFICATION_EXPIRATION, PASSWORD_RESET_EXPIRATION } from "$env/static/private";

export const auth = lucia({
  adapter: prisma((new PrismaClient)),
  env: dev ? "DEV" : "PROD",
  middleware: sveltekit(),
  transformDatabaseUser: userData => {
    return {
      userId: userData.id,
      email: userData.email,
      fullName: userData.name,
      emailVerified: userData.emailVerified,
    };
  },
});

export type Auth = typeof auth;

export const emailVerificationToken = idToken(
  auth,
  "email_verification",
  { expiresIn: 60 * Number.parseInt(EMAIL_VERIFICATION_EXPIRATION) },
);

export const passwordResetToken = idToken(
  auth,
  "password_reset",
  { expiresIn: 60 * Number.parseInt(PASSWORD_RESET_EXPIRATION) },
);
