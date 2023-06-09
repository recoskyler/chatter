import { writable } from "svelte/store";
import { browser } from "$app/environment";

const kChatsKey = "__chatter_chats__";

export type Role = "assistant" | "user" | "system";

export type Prompt = {
  uuid: string;
  timestamp: string;
  content: string;
  role: Role;
  isBusy: boolean;
  isSuccessful: boolean;
  isDeleted: boolean;
};

export type Chat = {
  title: string;
  timestamp: string;
  messages: Prompt[];
};

const storedChats = browser ? localStorage.getItem(kChatsKey) : "[]";

export const chats = writable<Chat[]>(JSON.parse(storedChats ?? "[]"));

chats.subscribe(value => {
  if (!browser) return;

  localStorage.setItem(kChatsKey, JSON.stringify(value));
});
