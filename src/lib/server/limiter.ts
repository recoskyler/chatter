import { RATE_LIMIT_SECRET } from "$env/static/private";
import { RateLimiter } from "sveltekit-rate-limiter/server";

export const signUpLimiter = new RateLimiter({
  rates: {
    IP: [10, "h"], // IP address limiter
    IPUA: [8, "m"], // IP + User Agent limiter
    cookie: {
      name: "chatter_su_rl",
      secret: RATE_LIMIT_SECRET,
      rate: [5, "m"],
      preflight: true,
    },
  },
});

export const signInLimiter = new RateLimiter({
  rates: {
    IP: [8, "h"], // IP address limiter
    IPUA: [5, "m"], // IP + User Agent limiter
    cookie: {
      name: "chatter_si_rl",
      secret: RATE_LIMIT_SECRET,
      rate: [3, "m"],
      preflight: true,
    },
  },
});

export const passwordResetLimiter = new RateLimiter({
  rates: {
    IP: [5, "h"], // IP address limiter
    IPUA: [3, "m"], // IP + User Agent limiter
    cookie: {
      name: "chatter_pr_rl",
      secret: RATE_LIMIT_SECRET,
      rate: [2, "m"],
      preflight: true,
    },
  },
});

export const emailVerificationLimiter = new RateLimiter({
  rates: {
    IP: [3, "h"], // IP address limiter
    IPUA: [2, "m"], // IP + User Agent limiter
    cookie: {
      name: "chatter_ev_rl",
      secret: RATE_LIMIT_SECRET,
      rate: [1, "m"],
      preflight: true,
    },
  },
});

export const profileUpdateLimiter = new RateLimiter({
  rates: {
    IP: [3, "h"], // IP address limiter
    IPUA: [4, "m"], // IP + User Agent limiter
    cookie: {
      name: "chatter_pu_rl",
      secret: RATE_LIMIT_SECRET,
      rate: [5, "m"],
      preflight: true,
    },
  },
});

export const accountUpdateLimiter = new RateLimiter({
  rates: {
    IP: [6, "h"], // IP address limiter
    IPUA: [6, "m"], // IP + User Agent limiter
    cookie: {
      name: "chatter_au_rl",
      secret: RATE_LIMIT_SECRET,
      rate: [12, "m"],
      preflight: true,
    },
  },
});
