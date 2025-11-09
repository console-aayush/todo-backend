import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import todosRouter from "./routes/todos";

const app = new Hono();

// ✅ Middlewares
app.use("*", logger());
app.use(
  "/*",
  cors({
    origin:
      "https://todo-app-mlwe2d57yhf942m9j8jqj8e8-5173.thekalkicinematicuniverse.com",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ✅ Health check route
app.get("/", (c) =>
  c.json({
    status: "ok",
    message: "Server is running",
  })
);

// ✅ Main todos route
app.route("/todos", todosRouter);

// ✅ Start server
Bun.serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("🚀 Server running at http://localhost:3000");

export default app;
