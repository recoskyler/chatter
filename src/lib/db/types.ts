import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  account, chatModel, chat, user, prompt, token,
} from "./schema";
import {
  MAX_EMAIL_LENGTH, MAX_NAME_LENGTH, MIN_EMAIL_LENGTH, MIN_NAME_LENGTH,
} from "$lib/constants";

// Zod Schemas

export const insertUserSchema = createInsertSchema(user, {
  email: schema => schema.email.email().min(MIN_EMAIL_LENGTH).max(MAX_EMAIL_LENGTH),
  name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
});

export const selectUserSchema = createSelectSchema(user);

export const insertTokenSchema = createInsertSchema(token);

export const selectTokenSchema = createSelectSchema(token);

export const insertChatSchema = createInsertSchema(chat, {
  name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  userId: z.string().length(15),
});

export const selectChatSchema = createSelectSchema(chat);

export const insertPromptSchema = createInsertSchema(prompt, {
  chatId: schema => schema.chatId.uuid(),
  content: z.string().min(1),
});

export const selectPromptSchema = createSelectSchema(prompt);

export const insertAccountSchema = createInsertSchema(account, {
  userId: z.string().length(15),
  name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  chatModelId: schema => schema.chatModelId.uuid(),
});

export const selectAccountSchema = createSelectSchema(account);

export const insertChatModelSchema = createInsertSchema(chatModel, {
  name: z.string().min(1).max(32),
  displayName: z.string().min(1).max(128),
});

export const selectChatModelSchema = createSelectSchema(chatModel);

// Types

export type NewUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export type NewChat = z.infer<typeof insertChatSchema>;
export type Chat = z.infer<typeof selectChatSchema>;

export type NewPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = z.infer<typeof selectPromptSchema>;

export type NewAccount = z.infer<typeof insertAccountSchema>;
export type Account = z.infer<typeof selectAccountSchema>;

export type NewChatModel = z.infer<typeof insertChatModelSchema>;
export type ChatModel = z.infer<typeof selectChatModelSchema>;

export type NewToken = z.infer<typeof insertTokenSchema>;
export type Token = z.infer<typeof selectTokenSchema>;
