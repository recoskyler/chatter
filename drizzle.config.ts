import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    user: process.env.VITE_DB_USER ?? "chatter",
    password: process.env.VITE_DB_PASSWORD,
    database: process.env.VITE_DB_DATABASE ?? "chatter",
    host: process.env.VITE_DB_HOST ?? "127.0.0.1",
    port: process.env.VITE_DB_FORWARD_PORT ?? "3306",
  },
} satisfies Config;
