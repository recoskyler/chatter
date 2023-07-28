import {
  error, fail, redirect,
} from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import type { PageServerLoad, Actions } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "$lib/constants";
import { signInLimiter } from "$lib/server/limiter";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export const load: PageServerLoad = async event => {
  signInLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  if (session) throw redirect(302, "/app");

  const form = await superValidate(loginSchema);

  return { form };
};

export const actions: Actions = {
  default: async event => {
    if (await signInLimiter.isLimited(event)) throw error(429, "Too many requests");

    const { request, locals } = event;

    const form = await superValidate(request, loginSchema);

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    try {
      const key = await auth.useKey("email", form.data.email, form.data.password);
      const session = await auth.createSession({ userId: key.userId, attributes: {} });

      locals.auth.setSession(session);
    } catch {
      return setError(form, "", "Invalid email or password");
    }
  },
};
