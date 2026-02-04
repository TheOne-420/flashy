CREATE TYPE "public"."role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "users_tbl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"bio" text,
	"avatar" text,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp,
	"password" text,
	"role" "role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_tbl_username_unique" UNIQUE("username"),
	CONSTRAINT "users_tbl_email_unique" UNIQUE("email")
);
