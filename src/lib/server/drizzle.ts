import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import {
  VITE_DB_DATABASE, VITE_DB_PASSWORD, VITE_DB_USER, VITE_DB_HOST, VITE_DB_FORWARD_PORT,
} from "$env/static/private";
import * as schema from "../db/schema";
import { Pool } from "pg";

export const pool = new Pool({
  host: VITE_DB_HOST === "" ? "127.0.0.1" : VITE_DB_HOST,
  port: Number.parseInt(VITE_DB_FORWARD_PORT === "" ? "5432" : VITE_DB_FORWARD_PORT),
  user: VITE_DB_USER === "" ? "chatter" : VITE_DB_USER,
  password: VITE_DB_PASSWORD === "" ? "chatter" : VITE_DB_PASSWORD,
  database: VITE_DB_DATABASE === "" ? "chatter" : VITE_DB_DATABASE,
});

await pool.connect();

export const db = drizzle(pool, { schema: schema });

await migrate(db, { migrationsFolder: "drizzle" });
