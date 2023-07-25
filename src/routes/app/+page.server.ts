import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle";
import { user } from "$lib/db/schema";
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

  if (dbUser.accounts.length === 0) throw redirect(302, "/app/setup");

  return { user: dbUser };
};
