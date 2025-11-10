import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // ✅ fix here
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  created_at: timestamp("created_at").defaultNow(),
});
