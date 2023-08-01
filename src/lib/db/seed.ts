import { db } from "../server/drizzle";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../db/schema";
import type { NewChatModel } from "./types";

const chatModels: NewChatModel[] = [
  {
    displayName: "ChatGPT 3.5 Turbo",
    name: "gpt-3.5-turbo",
    enabled: true,
  },
  {
    displayName: "ChatGPT 3.5 Turbo (16K tokens)",
    name: "gpt-3.5-turbo-16k",
    enabled: true,
  },
  {
    displayName: "ChatGPT 4",
    name: "gpt-4",
    enabled: true,
  },
  {
    displayName: "ChatGPT 4 (32K tokens)",
    name: "gpt-4-32k",
    enabled: true,
  },
];

export const seed = async () => {
  console.log("Seeding database...");

  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    await db.insert(schema.chatModel).values(chatModels).onConflictDoNothing();
    console.log("Seeding complete");
  } catch (error) {
    console.error("Failed to seed (some) Chat models");
    console.error(error);
  }
};
