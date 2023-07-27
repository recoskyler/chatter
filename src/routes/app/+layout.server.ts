
import { db } from "$lib/server/drizzle";
import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { EMAIL_VERIFICATION } from "$lib/constants";
import { eq } from "drizzle-orm";
import { user } from "$lib/db/schema";

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user: authUser, session } = await locals.auth.validateUser();

  if (!authUser || !session || (EMAIL_VERIFICATION && !authUser.verified)) {
    throw redirect(302, "/login");
  }

  const dbUser = await db.query.user.findFirst({
    with: {
      accounts: true,
      chats: true,
    },
    where: eq(user.id, authUser.userId),
  });

  if (!dbUser) throw error(404, "User not found");

  return { user: dbUser };
};
