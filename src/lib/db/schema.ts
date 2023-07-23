import { relations, type InferModel } from "drizzle-orm";
import {
  mysqlTable, bigint, varchar, boolean, timestamp, text, mysqlEnum, index,
} from "drizzle-orm/mysql-core";

// Lucia Auth

export const user = mysqlTable("auth_user", {
  id: varchar("id", { length: 15 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  verified: boolean("verified").default(false).notNull(),
});

export const session = mysqlTable("auth_session", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 15 })
    .notNull()
    .references(() => user.id),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
});

export const key = mysqlTable("auth_key", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 15 })
    .notNull()
    .references(() => user.id),
  primaryKey: boolean("primary_key").notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }),
  expires: bigint("expires", { mode: "number" }),
});

// Chatter

export const chatApi = mysqlTable("chat_api", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 32 })
    .notNull()
    .unique(),
  displayName: varchar("display_name", { length: 128 }).notNull(),
  enabled: boolean("enabled")
    .default(true)
    .notNull(),
}, table => ({ enabledIndex: index("api_enabled_index").on(table.enabled) }));

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  chatApiId: varchar("id", { length: 36 })
    .references(() => chatApi.id)
    .notNull(),
  userId: varchar("user_id", { length: 15 })
    .notNull()
    .references(() => user.id),
  deletedAt: timestamp("deleted_at"),
});

export const chat = mysqlTable("chat", {
  id: varchar("id", { length: 36 }).primaryKey(),
  remember: boolean("remember")
    .default(true)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: varchar("name", { length: 255 }).default("New chat"),
  userId: varchar("user_id", { length: 15 })
    .notNull()
    .references(() => user.id),
  deletedAt: timestamp("deleted_at"),
});

export const prompt = mysqlTable("prompt", {
  id: varchar("id", { length: 36 }).primaryKey(),
  chatId: varchar("id", { length: 36 })
    .references(() => chat.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  enabled: boolean("enabled")
    .default(true)
    .notNull(),
  busy: boolean("busy")
    .default(false)
    .notNull(),
  successful: boolean("successful")
    .default(false)
    .notNull(),
  role: mysqlEnum(
    "role",
    [
      "system",
      "user",
      "assistant",
    ],
  ).notNull(),
  content: text("content").notNull(),
  deletedAt: timestamp("deleted_at"),
}, table => ({ enabledIndex: index("prompt_enabled_index").on(table.enabled) }));

// Relations

export const userRelations = relations(user, ({ many }) => ({
  chats: many(chat),
  accounts: many(account),
}));

export const chatRelations = relations(
  chat,
  ({ many, one }) => ({
    prompts: many(prompt),
    user: one(user, {
      fields: [chat.userId],
      references: [user.id],
    }),
  }),
);

export const chatApiRelations = relations(
  chatApi,
  ({ many }) => ({ accounts: many(account) }),
);

export const accountRelations = relations(
  account,
  ({ one }) => ({
    chatApi: one(chatApi, {
      fields: [account.chatApiId],
      references: [chatApi.id],
    }),
    user: one(user, {
      fields: [account.userId],
      references: [user.id],
    }),
  }),
);

export const promptRelations = relations(
  prompt,
  ({ one }) => ({
    chat: one(chat, {
      fields: [prompt.chatId],
      references: [chat.id],
    }),
  }),
);

// Types

export type User = InferModel<typeof user, "select">;
export type NewUser = InferModel<typeof user, "insert">;

export type Chat = InferModel<typeof chat, "select">;
export type NewChat = InferModel<typeof chat, "insert">;

export type Prompt = InferModel<typeof prompt, "select">;
export type NewPrompt = InferModel<typeof prompt, "insert">;

export type Account = InferModel<typeof account, "select">;
export type NewAccount = InferModel<typeof account, "insert">;

export type ChatApi = InferModel<typeof chatApi, "select">;
export type NewChatApi = InferModel<typeof chatApi, "insert">;
