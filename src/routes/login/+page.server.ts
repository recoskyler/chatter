import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";
import type { PageServerLoad, Actions } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "$lib/constants";
import { signInLimiter } from "$lib/server/limiter";
import { WIZARD_TOWER_DEFAULT_EMAIL } from "$env/static/private";
import { db } from "$lib/server/drizzle";
import { user, userConfig } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

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
    const { request, locals } = event;

    const form = await superValidate(request, loginSchema);

    if (await signInLimiter.isLimited(event)) {
      return setError(
        form,
        "",
        "You are doing this too fast. Please wait a few minutes.",
      );
    }

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    try {
      const key = await auth.useKey("email", form.data.email.trim(), form.data.password);
      const session = await auth.createSession({ userId: key.userId, attributes: {} });

      locals.auth.setSession(session);

      const userCfg = await db.query.userConfig.findFirst({
        where: eq(user.id, key.userId),
        columns: { userRole: true },
      });

      if (!userCfg) {
        console.warn("User config not found");

        return;
      }

      if (form.data.email === WIZARD_TOWER_DEFAULT_EMAIL && userCfg.userRole !== "admin") {
        await db.update(userConfig)
          .set({ userRole: "admin" })
          .where(eq(user.id, key.userId));
      }

      if (form.data.email === WIZARD_TOWER_DEFAULT_EMAIL || userCfg.userRole === "admin") {
        throw redirect(302, "/tower");
      }
    } catch {
      return setError(form, "", "Invalid email or password");
    }
  },
};
