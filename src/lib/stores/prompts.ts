import type { Prompt } from "$lib/db/types";
import { writable } from "svelte/store";

export const prompts = writable<Prompt[]>([]);
