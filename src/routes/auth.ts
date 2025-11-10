// backend/routes/auth.ts
import { Hono } from "hono";
import { db, usersTable } from "../db/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { cors } from "hono/cors";

const router = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ------------------- CORS -------------------
// Adjust origin to your frontend URL
router.use("*", cors({ origin: "https://todo-app-mlwe2d57yhf942m9j8jqj8e8-5173.thekalkicinematicuniverse.com", credentials: true }));

// ------------------- Schemas -------------------
const signupSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// ------------------- Helpers -------------------
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

// ------------------- Signup -------------------
router.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { username, email, password } = signupSchema.parse(body);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (existing[0]) return c.json({ error: "Username already exists" }, 400);

    const [user] = await db
      .insert(usersTable)
      .values({ username, email, password })
      .returning();

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Cookie: secure=false for localhost, true for production HTTPS
    c.header(
      "Set-Cookie",
      serialize("session", token, {
        httpOnly: true,
        secure: false,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })
    );

    return c.json({ id: user.id, username: user.username, email: user.email });
  } catch (err: any) {
    return c.json({ error: err.message || "Signup failed" }, 400);
  }
});

// ------------------- Login -------------------
router.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = loginSchema.parse(body);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);
    const user = users[0];

    if (!user || user.password !== password)
      return c.json({ error: "Invalid credentials" }, 401);

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    c.header(
      "Set-Cookie",
      serialize("session", token, {
        httpOnly: true,
        secure: false, // false for localhost
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })
    );

    return c.json({ id: user.id, username: user.username, email: user.email });
  } catch (err: any) {
    return c.json({ error: err.message || "Login failed" }, 400);
  }
});

// ------------------- Logout -------------------
router.post("/logout", (c) => {
  c.header(
    "Set-Cookie",
    serialize("session", "", {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 0,
    })
  );
  return c.json({ message: "Logged out" });
});

// ------------------- Current User -------------------
router.get("/me", async (c) => {
  try {
    const user = getUserFromRequest(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);

    if (!dbUser[0]) return c.json({ error: "User not found" }, 404);

    return c.json(dbUser[0]);
  } catch (err) {
    console.error("Error in /auth/me:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default router;
