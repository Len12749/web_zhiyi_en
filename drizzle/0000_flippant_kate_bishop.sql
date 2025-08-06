CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"points" integer DEFAULT 20 NOT NULL,
	"has_infinite_points" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "processing_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"task_type" varchar(50) NOT NULL,
	"task_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"status_message" text,
	"input_filename" varchar(255) NOT NULL,
	"input_file_size" bigint NOT NULL,
	"input_storage_path" varchar(500) NOT NULL,
	"processing_params" jsonb DEFAULT '{}'::jsonb,
	"external_task_id" varchar(255),
	"estimated_points" integer DEFAULT 0,
	"actual_points_used" integer DEFAULT 0,
	"result_storage_path" varchar(500),
	"result_file_size" bigint,
	"result_filename" varchar(255),
	"error_code" varchar(50),
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "point_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"task_id" integer,
	"redeem_code_id" integer,
	"amount" integer NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"checkin_date" date NOT NULL,
	"points_earned" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_checkins_user_id_checkin_date_unique" UNIQUE("user_id","checkin_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "redeem_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"points_value" integer NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "redeem_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"task_id" varchar(255),
	"type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "processing_tasks" ADD CONSTRAINT "processing_tasks_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_task_id_processing_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "processing_tasks"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_redeem_code_id_redeem_codes_id_fk" FOREIGN KEY ("redeem_code_id") REFERENCES "redeem_codes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_checkins" ADD CONSTRAINT "user_checkins_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
