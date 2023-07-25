import { relations } from "drizzle-orm";
import {
  pgTable, bigint, varchar, boolean, timestamp, text, pgEnum, index, uuid,
} from "drizzle-orm/pg-core";

// Lucia Auth

export const user = pgTable("auth_user", {
  id: varchar("id", { length: 15 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  verified: boolean("verified").default(false).notNull(),
});

export const session = pgTable("auth_session", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 15 })
    .notNull()
    .references(() => user.id),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
});

export const key = pgTable("auth_key", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 15 })
    .notNull()
    .references(() => user.id),
  primaryKey: boolean("primary_key").notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }),
  expires: bigint("expires", { mode: "number" }),
});

// Chatter

export const chatModel = pgTable("chat_model", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 32 })
    .notNull()
    .unique(),
  displayName: varchar("display_name", { length: 128 }).notNull(),
  enabled: boolean("enabled")
    .default(true)
    .notNull(),
}, table => ({ enabledIndex: index("api_enabled_index").on(table.enabled) }));

export const account = pgTable("account", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  chatModelId: uuid("chat_model_id")
    .references(() => chatModel.id)
    .notNull(),
  userId: varchar("user_id", { length: 15 })
    .notNull()
    .references(() => user.id),
  deletedAt: timestamp("deleted_at"),
});

export const chat = pgTable("chat", {
  id: uuid("id").defaultRandom().primaryKey(),
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

export const roleEnum = pgEnum(
  "role",
  [
    "system",
    "user",
    "assistant",
  ],
);

export const prompt = pgTable("prompt", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
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
  role: roleEnum("role").notNull(),
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

export const chatModelRelations = relations(
  chatModel,
  ({ many }) => ({ accounts: many(account) }),
);

export const accountRelations = relations(
  account,
  ({ one }) => ({
    chatModel: one(chatModel, {
      fields: [account.chatModelId],
      references: [chatModel.id],
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
