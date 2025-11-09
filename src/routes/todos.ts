import { Hono } from "hono";
import { db, todosTable } from "../db/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = new Hono();

// ✅ Validation schema
const todoSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .refine((val) => isNaN(Number(val)), {
      message: "Title cannot be a number",
    }),
  completed: z.boolean().optional(),
  category: z.string().default("General"),
});

// ✅ GET all todos
router.get("/all", async (c) => {
  try {
    const search = c.req.query("search") || "";
    let todos = await db.select().from(todosTable);

    if (search) {
      const lower = search.toLowerCase();
      todos = todos.filter((t) => t.title.toLowerCase().includes(lower));
    }

    return c.json(todos); // ✅ always return array
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to fetch todos", details: `${err}` }, 500);
  }
});

// ✅ POST new todo
router.post("/add", async (c) => {
  try {
    const body = await c.req.json();
    const validated = todoSchema.parse(body);

    const [newTodo] = await db
      .insert(todosTable)
      .values({
        title: validated.title,
        completed: validated.completed ?? false,
        category: validated.category,
      })
      .returning();

    return c.json(newTodo, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: err.errors }, 400);
    }
    console.error(err);
    return c.json({ error: "Failed to create todo", details: `${err}` }, 500);
  }
});

// ✅ PUT update todo
router.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const body = await c.req.json();
    const validated = todoSchema.parse(body);

    const [updated] = await db
      .update(todosTable)
      .set({
        title: validated.title,
        completed: validated.completed ?? false,
        category: validated.category,
      })
      .where(eq(todosTable.id, id))
      .returning();

    if (!updated) return c.json({ error: "Todo not found" }, 404);
    return c.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: err.errors }, 400);
    }
    console.error(err);
    return c.json({ error: "Failed to update todo", details: `${err}` }, 500);
  }
});

// ✅ PATCH toggle todo completion
router.patch("/:id/toggle", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const [todo] = await db.select().from(todosTable).where(eq(todosTable.id, id));
    if (!todo) return c.json({ error: "Todo not found" }, 404);

    const [updated] = await db
      .update(todosTable)
      .set({ completed: !todo.completed })
      .where(eq(todosTable.id, id))
      .returning();

    return c.json(updated);
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to toggle todo", details: `${err}` }, 500);
  }
});

// ✅ DELETE todo
router.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const [deleted] = await db
      .delete(todosTable)
      .where(eq(todosTable.id, id))
      .returning();

    if (!deleted) return c.json({ error: "Todo not found" }, 404);
    return c.json({ message: "Deleted successfully", deleted });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to delete todo", details: `${err}` }, 500);
  }
});

export default router;
