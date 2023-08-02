import {
  error, fail, redirect,
} from "@sveltejs/kit";
import { db } from "$lib/server/drizzle";
import {
  account, chat, chatModel, user, userConfig,
} from "$lib/db/schema";
import { and, eq } from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { accountUpdateLimiter } from "$lib/server/limiter";
import type { Actions, PageServerLoad } from "./$types";
import {
  message, setError, superValidate,
} from "sveltekit-superforms/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(255),
  key: z.string().min(1).max(255),
  chatModelId: z.string().uuid(),
});

const deleteSchema = z.object({});
const permDeleteSchema = z.object({});
const restoreSchema = z.object({});

export const load: PageServerLoad = async event => {
  accountUpdateLimiter.cookieLimiter?.preflight(event);

  const { locals, params } = event;
  const session = await locals.auth.validate();

  if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      accounts: {
        with: { chatModel: true },
        where: eq(account.id, params.id),
      },
      config: { with: { defaultAccount: true } },
    },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  if (dbUser.config === null) throw redirect(302, "/app/setup");

  if (dbUser.accounts.length === 0) throw error(404, "Account not found");

  const dbChatModels = await db.query.chatModel.findMany({ where: eq(chatModel.enabled, true) });
  const [dbAccount] = dbUser.accounts;

  const form = await superValidate(dbAccount, schema);
  const deleteForm = await superValidate(deleteSchema, { id: "delete-form" });
  const permDeleteForm = await superValidate(permDeleteSchema, { id: "perm-delete-form" });
  const restoreForm = await superValidate(restoreSchema, { id: "restore-form" });

  return {
    user: dbUser,
    account: dbAccount,
    chatModels: dbChatModels,
    form,
    deleteForm,
    permDeleteForm,
    restoreForm,
  };
};

export const actions: Actions = {
  save: async event => {
    const { locals, params, request } = event;
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
      const dbAccount = await db.query.account.findFirst(
        { where: and(eq(account.id, params.id), eq(account.deleted, false)) },
      );

      if (!dbAccount) {
        return setError(
          form,
          "",
          "Cannot change deleted account. Restore first to make any changes.",
        );
      }

      await db.update(account).set(form.data).where(eq(account.id, params.id));
    } catch (e) {
      return setError(form, "", "Failed to save changes");
    }

    return message(form, "Successfully saved changes");
  },
  delete: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, deleteSchema);

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
      return fail(400, { deleteForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          chats: { where: eq(chat.accountId, params.id) },
          config: { with: { defaultAccount: true } },
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

      if (dbUser.chats.length > 0) {
        return setError(
          form,
          "",
          "There are 1 or more chats using this account. Please change the account used for those chats first.",
        );
      }

      const dbAccount = await db.query.account.findFirst(
        { where: and(eq(account.id, params.id), eq(account.deleted, false)) },
      );

      if (!dbAccount) {
        return setError(
          form,
          "",
          "Account not found or already restored/permanently deleted.",
        );
      }

      await db.update(userConfig)
        .set({ defaultAccountId: null })
        .where(
          and(
            eq(userConfig.userId, session.user.userId),
            eq(userConfig.defaultAccountId, dbAccount.id),
          ),
        );

      await db.update(account)
        .set({ deleted: true })
        .where(eq(account.id, params.id));
    } catch (e) {
      return setError(
        form,
        "",
        "Failed to delete account.",
      );
    }

    return { deleteForm: form };
  },
  restore: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, restoreSchema);

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
      return fail(400, { restoreForm: form });
    }

    try {
      const dbAccount = await db.query.account.findFirst(
        { where: and(eq(account.id, params.id), eq(account.deleted, true)) },
      );

      if (!dbAccount) {
        return setError(
          form,
          "",
          "Account not found or already restored/permanently deleted.",
        );
      }

      await db.update(account)
        .set({ deleted: false })
        .where(eq(account.id, params.id));
    } catch (e) {
      return setError(
        form,
        "",
        "Failed to restore account.",
      );
    }

    return { restoreForm: form };
  },
  permanentlyDelete: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, permDeleteSchema);

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
      return fail(400, { permDeleteForm: form });
    }

    try {
      const dbUser = await db.query.user.findFirst({
        with: {
          chats: { where: eq(chat.accountId, params.id) },
          config: { with: { defaultAccount: true } },
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

      if (dbUser.chats.length > 0) {
        return setError(
          form,
          "",
          "There are 1 or more chats using this account. Please change the account used for those chats first.",
        );
      }

      const dbAccount = await db.query.account.findFirst(
        { where: and(eq(account.id, params.id), eq(account.deleted, true)) },
      );

      if (!dbAccount) {
        return setError(
          form,
          "",
          "Account not found or already restored/permanently deleted.",
        );
      }

      await db.update(userConfig)
        .set({ defaultAccountId: null })
        .where(
          and(
            eq(userConfig.userId, session.user.userId),
            eq(userConfig.defaultAccountId, dbAccount.id),
          ),
        );

      await db.delete(account)
        .where(eq(account.id, params.id));
    } catch (e) {
      return setError(
        form,
        "",
        "Failed to permanently delete account.",
      );
    }

    throw redirect(302, "/app/accounts");
  },
};
