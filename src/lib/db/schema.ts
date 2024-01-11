import { relations } from "drizzle-orm";
import {
  pgTable, bigint, varchar, boolean, timestamp, text, pgEnum, index, uuid,
} from "drizzle-orm/pg-core";

// Lucia Auth

export const user = pgTable("auth_user", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  verified: boolean("verified").default(false).notNull(),
});

export const session = pgTable("auth_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
});

export const key = pgTable("auth_key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  hashedPassword: text("hashed_password"),
});

export const token = pgTable("auth_token", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expires: bigint("expires", { mode: "number" }).notNull(),
});

// Chatter

export const chatModel = pgTable("chat_model", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 32 })
    .notNull()
    .unique(),
  displayName: varchar("display_name", { length: 128 }).notNull(),
  enabled: boolean("enabled")
    .default(true)
    .notNull(),
}, table => ({ enabledIndex: index("api_enabled_index").on(table.enabled) }));

export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  chatModelId: uuid("chat_model_id")
    .references(() => chatModel.id)
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  deleted: boolean("deleted").notNull().default(false),
});

export const userRoleEnum = pgEnum(
  "user_role",
  [
    "user",
    "admin",
  ],
);

export const userConfig = pgTable("user_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  defaultAccountId: uuid("default_account_id")
    .references(() => account.id),
  userRole: userRoleEnum("user_role").notNull().default("user"),
});

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  remember: boolean("remember")
    .default(true)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: varchar("name", { length: 255 }).default("New chat"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  deleted: boolean("deleted").notNull().default(false),
  accountId: uuid("account_id")
    .references(() => account.id),
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
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .references(() => chat.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  enabled: boolean("enabled")
    .default(true)
    .notNull(),
  busy: boolean("busy")
    .default(false)
    .notNull(),
  successful: boolean("successful"),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
}, table => ({ enabledIndex: index("prompt_enabled_index").on(table.enabled) }));

// Relations

export const userRelations = relations(user, ({ many, one }) => ({
  chats: many(chat),
  accounts: many(account),
  config: one(userConfig, {
    fields: [user.id],
    references: [userConfig.userId],
  }),
}));

export const chatRelations = relations(
  chat,
  ({ many, one }) => ({
    prompts: many(prompt),
    user: one(user, {
      fields: [chat.userId],
      references: [user.id],
    }),
    defaultAccount: one(account, {
      fields: [chat.accountId],
      references: [account.id],
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

export const userConfigRelations = relations(
  userConfig,
  ({ one }) => ({
    defaultAccount: one(account, {
      fields: [userConfig.defaultAccountId],
      references: [account.id],
    }),
  }),
);
