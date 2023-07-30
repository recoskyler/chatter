import {
  error, fail, redirect,
} from "@sveltejs/kit";
import { db } from "$lib/server/drizzle";
import {
  account, chatModel, user, userConfig,
} from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { accountUpdateLimiter } from "$lib/server/limiter";
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { z } from "zod";
import type { NewAccount } from "$lib/db/types";

const schema = z.object({
  name: z.string().min(1).max(255),
  key: z.string().min(1).max(255),
  chatModelId: z.string().uuid(),
});

export const load: PageServerLoad = async event => {
  accountUpdateLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: { config: { with: { defaultAccount: true } } },
    where: eq(user.id, session.user.userId),
  });

  const dbChatModels = await db.query.chatModel.findMany({ where: eq(chatModel.enabled, true) });

  if (!dbUser) throw error(404, "User not found");

  const form = await superValidate(schema);

  form.data.chatModelId = dbChatModels[0].id;

  return { user: dbUser, chatModels: dbChatModels, form };
};

export const actions: Actions = {
  default: async event => {
    if (await accountUpdateLimiter.isLimited(event)) throw error(429, "Too many requests");

    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, schema);

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    let createdId = "";

    try {
      const newAccount: NewAccount = {
        chatModelId: form.data.chatModelId,
        userId: session.user.userId,
        key: form.data.key,
        name: form.data.name,
      };

      const [createdAccount] = await db.insert(account)
        .values(newAccount)
        .returning();

      const dbUser = await db.query.user.findFirst({
        with: { config: true },
        where: eq(user.id, session.user.userId),
      });

      if (!dbUser) throw error(404, "User not found");

      if (!dbUser.config.defaultAccountId) {
        await db.update(userConfig)
          .set({ defaultAccountId: createdAccount.id })
          .where(eq(userConfig.userId, session.user.userId));
      }

      createdId = createdAccount.id;
    } catch (e) {
      console.error("Failed to create account");
      console.error(e);

      return setError(form, "", "Failed to create account");
    }

    throw redirect(302, `/app/accounts/${createdId}`);
  },
};