import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import {
  VITE_DB_DATABASE, VITE_DB_PASSWORD, VITE_DB_USER, VITE_DB_HOST, VITE_DB_FORWARD_PORT,
} from "$env/static/private";
import * as schema from "../db/schema";

export const connectionPool = mysql.createPool({
  user: VITE_DB_USER,
  password: VITE_DB_PASSWORD,
  database: VITE_DB_DATABASE,
  host: VITE_DB_HOST,
  port: Number.parseInt(VITE_DB_FORWARD_PORT),
});

export const db = drizzle(connectionPool, { schema: schema });

await migrate(db, { migrationsFolder: "drizzle" });
