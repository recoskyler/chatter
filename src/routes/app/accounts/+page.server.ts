import {
  error, fail, redirect,
} from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle";
import { user, userConfig } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { z } from "zod";
import { setError, superValidate } from "sveltekit-superforms/server";
import { accountUpdateLimiter } from "$lib/server/limiter";

const schema = z.object({ accountId: z.string().uuid().nullable() });

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      accounts: { with: { chatModel: true } },
      chats: true,
      config: true,
    },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  if (!dbUser.config) throw redirect(302, "/app/setup");

  const form = await superValidate(schema);

  form.data.accountId = dbUser.config.defaultAccountId;

  return { user: dbUser, form };
};

export const actions: Actions = {
  default: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, schema);

    if (await accountUpdateLimiter.isLimited(event)) {
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
      const dbUser = await db.query.user.findFirst({
        with: { config: true },
        where: eq(user.id, session.user.userId),
      });

      if (!dbUser) {
        return setError(
          form,
          "",
          "User not found",
        );
      }

      await db.update(userConfig)
        .set({ defaultAccountId: form.data.accountId })
        .where(eq(userConfig.userId, session.user.userId));
    } catch (e) {
      console.error("Failed to create account");
      console.error(e);

      return setError(form, "", "Failed to create account");
    }

    return { form };
  },
};
