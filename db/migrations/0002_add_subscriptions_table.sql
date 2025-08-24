-- Create subscriptions table for tracking subscription history and stacking
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"billing_type" varchar(20) NOT NULL,
	"points_amount" integer NOT NULL,
	"membership_duration" integer,
	"membership_start_date" date,
	"membership_end_date" date,
	"casdoor_product_name" varchar(100) NOT NULL,
	"payment_id" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"next_points_date" date,
	"last_points_date" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX IF NOT EXISTS "subscriptions_plan_type_idx" ON "subscriptions"("plan_type");