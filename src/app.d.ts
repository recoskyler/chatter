/* eslint-disable no-unused-vars */
// See https://kit.svelte.dev/docs/types#app

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
    interface Locals {
      auth: import("lucia-auth").AuthRequest;
    }
		// interface PageData {}
		// interface Platform {}
	}
}

/// <reference types="lucia" />
declare global {
  namespace Lucia {
    type Auth = import("$lib/server/lucia").Auth;
    type UserAttributes = {
      email: string;
      name: string;
      verified: boolean;
    };
  }
}

declare module "@fortawesome/free-solid-svg-icons/index.es" {
  export * from "@fortawesome/free-solid-svg-icons";
}

export {};
