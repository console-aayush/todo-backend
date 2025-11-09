CREATE TABLE "todo" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false,
	"category" text DEFAULT 'General',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
