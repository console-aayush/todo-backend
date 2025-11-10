import { Hono } from "hono";
import { cors } from "hono/cors";
import todosRouter from "./routes/todos";
import authRouter from "./routes/auth";

const app = new Hono();

// ✅ Enable CORS with credentials
app.use(
  "/*",
  cors({
    origin: "https://todo-app-mlwe2d57yhf942m9j8jqj8e8-5173.thekalkicinematicuniverse.com",
    credentials: true,
  })
);
app.get("/", (c) => {
  return c.json({ message: "Hello World" });
});

app.route("/todos", todosRouter); 
app.route("/auth", authRouter);

Bun.serve({ fetch: app.fetch, port: 3000 });
console.log("🚀 Server running at http://localhost:3000");
export default app;
