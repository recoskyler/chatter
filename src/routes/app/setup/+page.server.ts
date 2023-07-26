import {
  error, redirect, fail,
} from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle";
import {
  account, chatModel, user,
} from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { setError, superValidate } from "sveltekit-superforms/server";
import { insertAccountSchema } from "$lib/db/types";

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

  const form = await superValidate(insertAccountSchema);

  form.data.chatModelId = chatModels[0].id;
  form.data.userId = dbUser.id;

  return { user: dbUser, chatModels, form };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const { user: authUser, session } = await locals.auth.validateUser();

    if (!authUser || !session || (EMAIL_VERIFICATION && !authUser.verified)) {
      throw redirect(302, "/login");
    }

    console.info("Creating first account...");

    const form = await superValidate(request, insertAccountSchema);

    if (!form.valid) {
      console.error("Form invalid");
      console.error(form.errors);
      return fail(400, { form });
    }

    const chatModels = await db.query.chatModel.findMany({ where: eq(chatModel.enabled, true) });

    if (chatModels.length === 0) {
      console.error("No models found. Did you seed the database?");
      throw error(404, "No models found");
    }

    const chatModelIds = chatModels.map(m => m.id);

    if (!chatModelIds.includes(form.data.chatModelId)) {
      console.error("Invalid model");
      return setError(form, "chatModelId", "Invalid model");
    }

    try {
      await db.insert(account).values(form.data);
      console.info("Created first account");
    } catch (e) {
      console.error("Failed to create account");
      console.error(e);
      throw error(500, "Failed to create account");
    }

    throw redirect(302, "/app");
  },
};
