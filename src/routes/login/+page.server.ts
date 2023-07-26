import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import type { PageServerLoad, Actions } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "$lib/constants";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.auth.validateUser();

  if (session) throw redirect(302, "/");

  const form = await superValidate(loginSchema);

  return { form };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, loginSchema);

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    try {
      const key = await auth.useKey("email", form.data.email, form.data.password);
      const session = await auth.createSession(key.userId);

      locals.auth.setSession(session);
    } catch {
      return setError(form, "", "Invalid email or password");
    }
  },
};
