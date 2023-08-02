import { lucia } from "lucia";
import { sveltekit } from "lucia/middleware";
import { dev } from "$app/environment";
import { db, pool } from "./drizzle";
import { pg } from "@lucia-auth/adapter-postgresql";
import { generateRandomString, isWithinExpiration } from "lucia/utils";
import { eq } from "drizzle-orm";
import { token } from "$lib/db/schema";
import type { NewToken } from "$lib/db/types";
import { EMAIL_VERIFICATION_EXPIRATION, PASSWORD_RESET_EXPIRATION } from "$env/static/private";

export const auth = lucia({
  adapter: pg(
    pool,
    {
      user: "auth_user",
      key: "auth_key",
      session: "auth_session",
    },
  ),
  env: dev ? "DEV" : "PROD",
  middleware: sveltekit(),
  getUserAttributes: data => ({
    email: data.email,
    verified: data.verified,
    name: data.name,
  }),
});

export type Auth = typeof auth;

export const generateVerificationToken = async (userId: string, expirationInMinutes: number) => {
  const storedUserTokens = await db.query.token.findMany({ where: eq(token.userId, userId) });

  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find(token => {
      return isWithinExpiration(
        token.expires - (1000 * 60 * expirationInMinutes) / 2,
      );
    });

    if (reusableStoredToken) return reusableStoredToken.id;
  }

  const verificationToken: NewToken = {
    id: generateRandomString(128),
    expires: (new Date).getTime() + (1000 * 60 * expirationInMinutes),
    userId: userId,
  };

  await db.insert(token).values(verificationToken);

  return verificationToken.id;
};

export const validateToken = async (verificationToken: string) => {
  const storedToken = await db.query.token.findFirst({ where: eq(token.id, verificationToken) });

  if (!storedToken) throw new Error("Expired or invalid token");

  await db.delete(token).where(eq(token.id, verificationToken));

  if (!isWithinExpiration(storedToken.expires)) {
    throw new Error("Expired or invalid token");
  }

  return storedToken.userId;
};

export const generateEmailVerificationToken = async (userId: string) => {
  const expiration = EMAIL_VERIFICATION_EXPIRATION === ""
    ? 10
    : Number(EMAIL_VERIFICATION_EXPIRATION);

  return await generateVerificationToken(userId, expiration);
};

export const generatePasswordResetToken = async (userId: string) => {
  const expiration = PASSWORD_RESET_EXPIRATION === ""
    ? 10
    : Number(PASSWORD_RESET_EXPIRATION);

  return await generateVerificationToken(userId, expiration);
};
