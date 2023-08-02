import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = "5432";
const DEFAULT_USER = "chatter";
const DEFAULT_PASSWORD = "chatter";
const DEFAULT_DATABASE = "chatter";
const DEFAULT_HOSTNAME = "127.0.0.1";

const user = process.env.VITE_DB_USER === ""
  ? DEFAULT_USER
  : (process.env.VITE_DB_USER ?? DEFAULT_USER);

const password = process.env.VITE_DB_PASSWORD === ""
  ? DEFAULT_PASSWORD
  : (process.env.VITE_DB_PASSWORD ?? DEFAULT_PASSWORD);

const database = process.env.VITE_DB_DATABASE === ""
  ? DEFAULT_DATABASE
  : (process.env.VITE_DB_DATABASE ?? DEFAULT_DATABASE);

const host = process.env.VITE_DB_HOST === ""
  ? DEFAULT_HOSTNAME
  : (process.env.VITE_DB_HOST ?? DEFAULT_HOSTNAME);

const port = Number.parseInt(
  process.env.VITE_DB_FORWARD_PORT === ""
    ? DEFAULT_PORT
    : (process.env.VITE_DB_FORWARD_PORT ?? DEFAULT_PORT)
);

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    user: user,
    password: password,
    database: database,
    host: host,
    port: port,
  },
} satisfies Config;
