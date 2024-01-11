import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle";
import {
  account, chat, user,
} from "$lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { EMAIL_VERIFICATION } from "$lib/constants";

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      chats: true,
      accounts: true,
      config: { with: { defaultAccount: true } },
    },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  if (dbUser.config === null) throw redirect(302, "/app/setup");

  if (dbUser.config.userRole !== "admin") {
    throw redirect(302, "/app");
  }

  const userCount = await db.select({ count: sql<number>`cast(count(${user.id}) as int)` })
    .from(user).execute();

  const chatsCount = await db.select({ count: sql<number>`cast(count(${chat.id}) as int)` })
    .from(chat).execute();

  const accountsCount = await db.select({ count: sql<number>`cast(count(${account.id}) as int)` })
    .from(account).execute();

  return {
    user: dbUser,
    stats: {
      userCount: userCount[0].count,
      chatsCount: chatsCount[0].count,
      accountsCount: accountsCount[0].count,
    },
  };
};

