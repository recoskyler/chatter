import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import type { PageServerLoad, Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");

    if (typeof password !== "string" || typeof name !== "string" || typeof email !== "string") {
      return fail(400);
    }

    if (password.length < 8 || name.length < 2 || email.length < 5) {
      return fail(400);
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
        },
      });

      const session = await auth.createSession(user.userId);

      locals.auth.setSession(session);
    } catch {
      // username taken
      return fail(400);
    }
  },
};

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.auth.validateUser();

  if (session) throw redirect(302, "/");

  return {};
};
