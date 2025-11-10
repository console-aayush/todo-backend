ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "todos" DROP CONSTRAINT "todos_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "user_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();