import {
  error, fail, redirect,
} from "@sveltejs/kit";
import { db } from "$lib/server/drizzle";
import {
  account,
  chat, prompt, user,
} from "$lib/db/schema";
import { and, eq } from "drizzle-orm";
import { EMAIL_VERIFICATION, MAX_CHATS } from "$lib/constants";
import { chatLimiter } from "$lib/server/limiter";
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { z } from "zod";
import type { NewChat, NewPrompt } from "$lib/db/types";

const schema = z.object({
  name: z.string().min(1).max(255),
  prompt: z.string().min(5).max(255),
  accountId: z.string().uuid(),
});

export const load: PageServerLoad = async event => {
  chatLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      config: { with: { defaultAccount: true } },
      chats: true,
      accounts: {
        with: { chatModel: true },
        where: eq(account.deleted, false),
      },
    },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  if (dbUser.config === null) throw redirect(302, "/app/setup");

  if (dbUser.chats.length >= MAX_CHATS) throw redirect(302, "/app");

  if (dbUser.accounts.length === 0) throw redirect(302, "/app/accounts");

  const form = await superValidate(schema);

  form.data.prompt = "You are a helpful assistant";
  form.data.accountId = dbUser.config.defaultAccountId ?? dbUser.accounts[0].id;

  return { form, user: dbUser };
};

export const actions: Actions = {
  default: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, schema);

    if (await chatLimiter.isLimited(event)) {
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

    let createdId = "";

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: true } },
          chats: true,
          accounts: {
            where: and(
              eq(account.id, form.data.accountId),
              eq(account.deleted, false),
            ),
          },
        },
        where: eq(user.id, session.user.userId),
      });

      if (!dbUser) {
        return setError(
          form,
          "",
          "User not found",
        );
      }

      if (dbUser.chats.length >= MAX_CHATS) {
        return setError(
          form,
          "",
          // eslint-disable-next-line max-len
          `You can have maximum ${MAX_CHATS} chats. Please permanently delete unused chats first.`,
        );
      }

      if (dbUser.accounts.length === 0) {
        return setError(
          form,
          "",
          "Account not found or deleted",
        );
      }

      const newChat: NewChat = {
        userId: session.user.userId,
        name: form.data.name,
        accountId: form.data.accountId,
      };

      const [dbChat] = await db.insert(chat)
        .values(newChat)
        .returning();

      const newSystemPrompt: NewPrompt = {
        content: form.data.prompt,
        role: "system",
        chatId: dbChat.id,
      };

      await db.insert(prompt).values(newSystemPrompt);

      createdId = dbChat.id;
    } catch (e) {
      console.error("Failed to create chat");
      console.error(e);

      return setError(form, "", "Failed to create chat");
    }

    throw redirect(302, `/app/chat/${createdId}`);
  },
};
