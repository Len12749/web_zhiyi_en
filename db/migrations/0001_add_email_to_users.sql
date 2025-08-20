-- Add email column to users table
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "email" varchar(255);

--> statement-breakpoint
