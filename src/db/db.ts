import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

console.log("Database URL:", process.env.DATABASE_URL);

const sql = postgres(process.env.DATABASE_URL!);

// ✅ Correct async check
sql`SELECT 1`
  .then(() => console.log("Database connection successful"))
  .catch((err) => console.error("Database connection error:", err));

export const db = drizzle(sql, { schema });

export const usersTable = schema.users;
export const todosTable = schema.todos;
