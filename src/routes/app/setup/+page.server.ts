import {
  error, redirect, fail,
} from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle";
import {
  account, chatModel, user, type NewAccount,
} from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";

export const load: PageServerLoad = async ({ locals }) => {
  const { user: authUser, session } = await locals.auth.validateUser();

  if (!authUser || !session || (EMAIL_VERIFICATION && !authUser.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      chats: true,
      accounts: true,
    },
    where: eq(user.id, authUser.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  const chatModels = await db.query.chatModel.findMany({ where: eq(chatModel.enabled, true) });

  if (chatModels.length === 0) throw error(404, "No models found");

  if (dbUser.accounts.length !== 0) throw redirect(302, "/app");

  return { user: dbUser, chatModels: chatModels };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const { user: authUser, session } = await locals.auth.validateUser();

    if (!authUser || !session || (EMAIL_VERIFICATION && !authUser.verified)) {
      throw redirect(302, "/login");
    }

    const form = await request.formData();
    const name = form.get("name");
    const key = form.get("key");
    const model = form.get("model");

    if (typeof name !== "string" || typeof key !== "string" || typeof model !== "string") {
      return fail(400, { error: "Invalid input" });
    }

    if (name.trim().length < 2 || name.trim().length > 255) {
      return fail(400, { error: "Invalid input" });
    }

    if (key.trim().length < 2 || key.trim().length > 255) {
      return fail(400, { error: "Invalid input" });
    }

    const chatModels = await db.query.chatModel.findMany({ where: eq(chatModel.enabled, true) });

    if (chatModels.length === 0) throw error(404, "No models found");

    const chatModelIds = chatModels.map(m => m.id);

    if (!chatModelIds.includes(model)) {
      return fail(400, { error: "Invalid model" });
    }

    const record: NewAccount = {
      chatApiId: model,
      key: key,
      name: name,
      userId: authUser.userId,
    };

    try {
      await db.insert(account).values(record);
    } catch (e) {
      throw error(500, "Failed to create account");
    }

    throw redirect(302, "/app");
  },
};
