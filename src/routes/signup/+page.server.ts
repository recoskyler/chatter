import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import type { PageServerLoad, Actions } from "./$types";
import { EMAIL_VERIFICATION } from "$env/static/private";

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");

    if (typeof password !== "string" || typeof name !== "string" || typeof email !== "string") {
      console.error("Invalid types");

      return fail(400, { error: "Invalid input" });
    }

    if (name.trim().length < 2) {
      console.error("Invalid name");

      return fail(400, { error: "Invalid name. Name must be 2 characters or more" });
    }

    if (email.length < 5) {
      console.error("Invalid email");

      return fail(400, { error: "Invalid email" });
    }

    if (password.length < 8) {
      console.error("Invalid password");

      return fail(400, { error: "Invalid password. Must contain at least 1 lowercase, 1 uppercase letter, 1 number, 1 special character, and be 8-64 characters long." });
    }

    try {
      const user = await auth.createUser({
        primaryKey: {
          providerId: "email",
          providerUserId: email,
          password,
        },
        attributes: {
          name: name,
          email: email,
          emailVerified: false,
        },
      });

      console.log("User created");

      const session = await auth.createSession(user.userId);

      console.log("Session created");

      locals.auth.setSession(session);

      console.log("Set session");
    } catch (e) {
      console.error("Email taken: ", e);

      return fail(400, { error: "Email taken" });
    }

    if (EMAIL_VERIFICATION === "true") {
      throw redirect(302, "/email-verification");
    }

    throw redirect(302, "/login");
  },
};

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.auth.validateUser();

  if (session) throw redirect(302, "/");

  return {};
};
