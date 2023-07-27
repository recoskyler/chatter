import type { Chat } from "$lib/db/types";
import { writable } from "svelte/store";

export const selectedChat = writable<Chat | null>(null);
