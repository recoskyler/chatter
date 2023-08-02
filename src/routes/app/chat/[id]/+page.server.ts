import {
  error, fail, redirect,
} from "@sveltejs/kit";
import { db } from "$lib/server/drizzle";
import {
  chat, user, prompt, account,
} from "$lib/db/schema";
import {
  and, asc, eq,
} from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { chatLimiter } from "$lib/server/limiter";
import type { Actions, PageServerLoad } from "./$types";
import {
  message, setError, superValidate,
} from "sveltekit-superforms/server";
import { z } from "zod";
import type { NewPrompt, Prompt } from "$lib/db/types";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

const accountSchema = z.object({ accountId: z.string().uuid() });

const deleteSchema = z.object({});
const permDeleteSchema = z.object({});
const restoreSchema = z.object({});

const renameSchema = z.object({ name: z.string().min(1).max(255) });

const toggleSchema = z.object({
  promptId: z.string().uuid(),
  previousState: z.boolean(),
  remember: z.boolean(),
});

const systemSchema = z.object(
  { prompt: z.string().min(1).default("You are a helpful assistant") },
);

const chatSchema = z.object({
  content: z.string().min(1),
  remember: z.boolean().default(false),
});

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const load: PageServerLoad = async event => {
  chatLimiter.cookieLimiter?.preflight(event);

  const { locals, params } = event;
  const session = await locals.auth.validate();

  if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      accounts: {
        with: { chatModel: true },
        where: eq(account.deleted, false),
      },
      config: { with: { defaultAccount: true } },
      chats: {
        with: { prompts: { orderBy: asc(prompt.createdAt) } },
        where: eq(chat.id, params.id),
      },
    },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  if (dbUser.config === null) throw redirect(302, "/app/setup");

  if (dbUser.chats.length === 0) throw error(404, "Chat not found");

  if (dbUser.accounts.length === 0) throw redirect(302, "/app/accounts");

  const renameForm = await superValidate(renameSchema);
  const chatForm = await superValidate(chatSchema);
  const systemForm = await superValidate(systemSchema);
  const toggleForm = await superValidate(toggleSchema);
  const accountForm = await superValidate(accountSchema);
  const deleteForm = await superValidate(deleteSchema, { id: "delete-form" });
  const permDeleteForm = await superValidate(permDeleteSchema, { id: "perm-delete-form" });
  const restoreForm = await superValidate(restoreSchema, { id: "restore-form" });

  renameForm.data.name = dbUser.chats[0].name ?? "New name";
  chatForm.data.remember = dbUser.chats[0].remember;
  toggleForm.data.remember = dbUser.chats[0].remember;
  accountForm.data.accountId = dbUser.chats[0].accountId
    ?? dbUser.config.defaultAccountId
    ?? dbUser.accounts[0].id;

  if (dbUser.chats[0].prompts.find(p => p.role === "system")) {
    systemForm.data.prompt = dbUser.chats[0].prompts.find(p => p.role === "system")?.content ?? "";
  }

  return {
    user: dbUser,
    renameForm,
    chatForm,
    systemForm,
    toggleForm,
    accountForm,
    restoreForm,
    deleteForm,
    permDeleteForm,
  };
};

export const actions: Actions = {
  rename: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, renameSchema);

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
      return fail(400, { renameForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: true } },
          chats: {
            with: { prompts: true },
            where: and(
              eq(chat.id, params.id),
              eq(chat.deleted, false),
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found or deleted",
        );
      }

      await db.update(chat)
        .set({ name: form.data.name })
        .where(eq(chat.id, params.id));
    } catch (e) {
      console.error("Failed to rename chat");
      console.error(e);

      return setError(form, "", "Failed to rename chat");
    }

    return { renameForm: form };
  },
  submit: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, chatSchema);

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
      return fail(400, { chatForm: form });
    }

    let submittedPrompt: Prompt | null = null;

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: { with: { chatModel: true } } } },
          chats: {
            with: {
              defaultAccount: { with: { chatModel: true } },
              prompts: { orderBy: [asc(prompt.createdAt)] },
            },
            where: and(
              eq(chat.id, params.id),
              eq(chat.deleted, false),
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found or deleted",
        );
      }

      if (!dbUser.chats[0].defaultAccount) {
        return setError(
          form,
          "",
          "Please select a valid account first from the \"Chat configuration\" above.",
        );
      }

      const newUserPrompt: NewPrompt = {
        role: "user",
        content: form.data.content,
        chatId: dbUser.chats[0].id,
        busy: true,
      };

      if (dbUser.chats[0].prompts.length === 0) {
        return setError(
          form,
          "",
          "System prompt not found. Please try creating a new chat.",
        );
      }

      const dbSystemPrompt = dbUser.chats[0].prompts.find(p => p.role === "system");

      if (!dbSystemPrompt) {
        return setError(
          form,
          "",
          "System prompt not found. Please try creating a new chat.",
        );
      }

      const systemPrompt: Message = { role: "system", content: dbSystemPrompt.content };

      const [dbUserPrompt] = await db.insert(prompt).values(newUserPrompt).returning();

      submittedPrompt = dbUserPrompt;

      const configuration = new Configuration({ apiKey: dbUser.chats[0].defaultAccount.key });
      const openai = new OpenAIApi(configuration);

      const lastMessage: Message = { role: dbUserPrompt.role, content: dbUserPrompt.content };

      const messages: Message[] = form.data.remember
        ? dbUser.chats[0].prompts
          .filter(p => p.enabled && !p.busy && p.successful)
          .map(p => ({ role: p.role, content: p.content }))
          .concat(lastMessage)
        : [systemPrompt, lastMessage];

      // console.log(messages);

      const completion = await openai.createChatCompletion({
        model: dbUser.chats[0].defaultAccount.chatModel.name,
        messages: messages,
      });

      const completionMessages: NewPrompt[] = completion.data.choices
        .filter(c => c.message !== undefined)
        .map(c => ({
          role: "assistant",
          content: c?.message?.content ?? "",
          busy: false,
          successful: true,
          chatId: dbUser.chats[0].id,
        }));

      // console.log(completionMessages);

      if (completionMessages.length === 0) {
        return message(form, JSON.stringify([submittedPrompt]));
      }

      [submittedPrompt] = await db.update(prompt)
        .set({ busy: false, successful: true })
        .where(eq(prompt.id, submittedPrompt.id))
        .returning();

      await db.update(chat)
        .set({ remember: form.data.remember })
        .where(eq(chat.id, dbUser.chats[0].id));

      const dbCompletionPrompts: Prompt[] = [submittedPrompt].concat(
        (await db.insert(prompt).values(completionMessages).returning()),
      );

      return message(form, JSON.stringify(dbCompletionPrompts));
    } catch (e) {
      console.error("Failed to submit prompt");
      console.error(e);

      if (submittedPrompt) {
        [submittedPrompt] = await db.update(prompt)
          .set({ busy: false, successful: false })
          .where(eq(prompt.id, submittedPrompt.id))
          .returning();
      }

      form.errors._errors = ["Failed to submit form"];

      if (axios.isAxiosError(e)) {
        let errorMessage = "";

        switch (e.response?.status) {
          case 401:
            errorMessage = "Invalid or expired OpenAI API key";
            break;

          case 429:
            errorMessage = "OpenAI rate limit or quota exceeded";
            break;

          case 500:
            errorMessage = "Failed to process prompt";
            break;

          case 503:
            errorMessage = "ChatGPT servers are currently overloaded";
            break;

          default:
            errorMessage = "Failed to submit request";
            break;
        }

        form.errors._errors = [errorMessage];
      }

      const returnArray = submittedPrompt ? [submittedPrompt] : [];

      return message(form, JSON.stringify(returnArray));
    }
  },
  updateSystem: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, systemSchema);

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
      return fail(400, { systemForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: true } },
          chats: {
            with: { prompts: true },
            where: and(
              eq(chat.id, params.id),
              eq(chat.deleted, false),
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found or deleted",
        );
      }

      if (dbUser.chats[0].prompts.length === 0) {
        return setError(
          form,
          "",
          "System prompt not found. Please try creating a new chat.",
        );
      }

      const dbSystemPrompt = dbUser.chats[0].prompts.find(p => p.role === "system");

      if (!dbSystemPrompt) {
        return setError(
          form,
          "",
          "System prompt not found. Please try creating a new chat.",
        );
      }

      await db.update(prompt)
        .set({ content: form.data.prompt })
        .where(eq(prompt.id, dbSystemPrompt.id));
    } catch (e) {
      console.error("Failed to save system prompt");
      console.error(e);

      return setError(form, "", "Failed to save system prompt");
    }

    return { systemForm: form };
  },
  toggle: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, toggleSchema);

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
      return fail(400, { toggleForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: true } },
          chats: {
            with: { prompts: true },
            where: and(
              eq(chat.id, params.id),
              eq(chat.deleted, false),
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found or deleted",
        );
      }

      if (dbUser.chats[0].prompts.length === 0) {
        return setError(
          form,
          "",
          "System prompt not found. Please try creating a new chat.",
        );
      }

      const dbSystemPrompt = dbUser.chats[0].prompts.find(p => p.role === "system");

      if (!dbSystemPrompt) {
        return setError(
          form,
          "",
          "System prompt not found. Please try creating a new chat.",
        );
      }

      if (form.data.promptId === dbSystemPrompt.id) {
        return setError(form, "", "System prompt cannot be toggled");
      }

      await db.update(prompt)
        .set({ enabled: !form.data.previousState })
        .where(eq(prompt.id, form.data.promptId));
    } catch (e) {
      console.error("Failed to save system prompt");
      console.error(e);

      return setError(form, "", "Failed to save system prompt");
    }

    return { toggleForm: form };
  },
  changeAccount: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, accountSchema);

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
      return fail(400, { accountForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: true,
          accounts: {
            where: and(
              eq(account.id, form.data.accountId),
              eq(account.deleted, false),
            ),
          },
          chats: {
            where: and(
              eq(chat.id, params.id),
              eq(chat.deleted, false),
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found or deleted",
        );
      }

      if (dbUser.accounts.length === 0) {
        return setError(
          form,
          "",
          "Account not found or deleted",
        );
      }

      await db.update(chat)
        .set({ accountId: form.data.accountId })
        .where(eq(chat.userId, session.user.userId));
    } catch (e) {
      console.error("Failed to create account");
      console.error(e);

      return setError(form, "", "Failed to create account");
    }

    return { accountForm: form };
  },
  delete: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, deleteSchema);

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
      return fail(400, { deleteForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: true } },
          chats: { where: and(eq(chat.id, params.id), eq(chat.deleted, false)) },
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found, already restored, or permanently deleted",
        );
      }

      await db.update(chat)
        .set({ deleted: true })
        .where(eq(chat.id, params.id));
    } catch (e) {
      console.error("Failed to delete chat");
      console.error(e);

      return setError(form, "", "Failed to delete chat");
    }

    return { toggleForm: form };
  },
  restore: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, restoreSchema);

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
      return fail(400, { restoreForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: true } },
          chats: { where: and(eq(chat.id, params.id), eq(chat.deleted, true)) },
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found, already restored, or permanently deleted",
        );
      }

      await db.update(chat)
        .set({ deleted: false })
        .where(eq(chat.id, params.id));
    } catch (e) {
      console.error("Failed to restore chat");
      console.error(e);

      return setError(form, "", "Failed to restore chat");
    }

    return { toggleForm: form };
  },
  permanentlyDelete: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, permDeleteSchema);

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
      return fail(400, { permDeleteForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          config: { with: { defaultAccount: true } },
          chats: { where: and(eq(chat.id, params.id), eq(chat.deleted, true)) },
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

      if (dbUser.chats.length === 0) {
        return setError(
          form,
          "",
          "Chat not found, already restored, or permanently deleted",
        );
      }

      await db.delete(prompt)
        .where(eq(prompt.chatId, params.id));

      await db.delete(chat)
        .where(eq(chat.id, params.id));
    } catch (e) {
      console.error("Failed to permanently delete chat");
      console.error(e);

      return setError(form, "", "Failed to permanently delete chat");
    }

    throw redirect(302, "/app");
  },
};
