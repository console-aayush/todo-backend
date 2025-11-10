import { Hono } from "hono";
import { db, todosTable } from "../db/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const router = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const todoSchema = z.object({ title: z.string().min(1) });

function getUserFromRequest(c: any) {
  const cookieHeader = c.req.headers.get("cookie") || "";
  const cookies = parse(cookieHeader);
  const token = cookies.session;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch {
    return null;
  }
}

router.get("/all", async (c) => {
  const user = getUserFromRequest(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const todos = await db.select().from(todosTable).where(eq(todosTable.userId, user.id));
  return c.json(todos);
});

router.post("/add", async (c) => {
  const user = getUserFromRequest(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { title } = todoSchema.parse(body);

  const [todo] = await db.insert(todosTable).values({ title, userId: user.id }).returning();
  return c.json(todo);
});

router.put("/:id", async (c) => {
  const user = getUserFromRequest(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const { title, completed } = body;

  const [updated] = await db
    .update(todosTable)
    .set({ title, completed })
    .where(eq(todosTable.id, id))
    .returning();

  return c.json(updated);
});

router.patch("/:id/toggle", async (c) => {
  const user = getUserFromRequest(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = Number(c.req.param("id"));
  const [todo] = await db.select().from(todosTable).where(eq(todosTable.id, id));
  if (!todo) return c.json({ error: "Todo not found" }, 404);

  const [updated] = await db
    .update(todosTable)
    .set({ completed: !todo.completed })
    .where(eq(todosTable.id, id))
    .returning();

  return c.json(updated);
});

router.delete("/:id", async (c) => {
  const user = getUserFromRequest(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = Number(c.req.param("id"));
  await db.delete(todosTable).where(eq(todosTable.id, id));
  return c.json({ message: "Todo deleted" });
});

export default router;
