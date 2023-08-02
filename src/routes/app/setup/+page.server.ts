import {
  error, redirect, fail,
} from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle";
import {
  account, chatModel, user, userConfig,
} from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { setError, superValidate } from "sveltekit-superforms/server";
import {
  insertAccountSchema, type NewAccount, type NewUserConfig,
} from "$lib/db/types";
import { seed } from "$lib/db/seed";

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      chats: true,
      accounts: true,
    },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  let chatModels = await db.query.chatModel.findMany(
    { where: eq(chatModel.enabled, true) },
  );

  if (chatModels.length === 0) {
    await seed();

    chatModels = await db.query.chatModel.findMany(
      { where: eq(chatModel.enabled, true) },
    );
  }

  if (dbUser.accounts.length !== 0) throw redirect(302, "/app");

  const form = await superValidate(insertAccountSchema.omit({ userId: true }));

  form.data.chatModelId = chatModels[0].id;

  return { user: dbUser, chatModels, form };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    console.info("Creating first account...");

    const form = await superValidate(request, insertAccountSchema.omit({ userId: true }));

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    const chatModels = await db.query.chatModel.findMany({ where: eq(chatModel.enabled, true) });

    if (chatModels.length === 0) {
      return setError(form, "chatModelId", "No models found, contact the developer");
    }

    const chatModelIds = chatModels.map(m => m.id);

    if (!chatModelIds.includes(form.data.chatModelId)) {
      console.error("Invalid model");
      return setError(form, "chatModelId", "Invalid model");
    }

    try {
      const newAccount: NewAccount = {
        userId: session.user.userId,
        chatModelId: form.data.chatModelId,
        key: form.data.key,
        name: form.data.name.trim(),
      };

      const [dbAccount] = await db
        .insert(account)
        .values(newAccount)
        .returning({ id: account.id });

      const config: NewUserConfig = {
        userId: session.user.userId,
        defaultAccountId: dbAccount.id,
      };

      await db.insert(userConfig).values(config);
    } catch (e) {
      return setError(form, "", "Failed to create account.");
    }

    throw redirect(302, "/app");
  },
};
