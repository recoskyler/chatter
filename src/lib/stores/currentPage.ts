import { writable } from "svelte/store";

export const CHATTER_PAGE = {
  CHATS: "CHATS",
  ACCOUNTS: "ACCOUNTS",
  PROFILE: "PROFILE",
} as const;

type ObjectValues<T> = T[keyof T];

export type ChatterPage = ObjectValues<typeof CHATTER_PAGE>;

export const currentPage = writable<ChatterPage>(CHATTER_PAGE.CHATS);
