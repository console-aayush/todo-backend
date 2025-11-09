import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create Postgres client with pooling
console.log(process.env.DATABASE_URL);
const sql = postgres(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export tables
export const todosTable = schema.todos;


