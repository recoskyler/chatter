import { writable } from "svelte/store";

export const canGoBack = writable<string | null>(null);
