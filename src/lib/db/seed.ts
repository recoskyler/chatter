import { db } from "../server/drizzle";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../db/schema";
import type { NewChatModel } from "./types";

const chatModels: NewChatModel[] = [
  {
    displayName: "Chat-GPT 3.5 Turbo",
    name: "gpt-3.5-turbo",
    enabled: true,
  },
];

export const seed = async () => {
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    await db.insert(schema.chatModel).values(chatModels).onConflictDoNothing();
  } catch (error) {
    console.error("Failed to seed (some) Chat models");
  }
};
