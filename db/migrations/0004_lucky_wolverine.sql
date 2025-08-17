DROP TABLE "code_redemptions";--> statement-breakpoint
ALTER TABLE "processing_tasks" RENAME COLUMN "estimated_points" TO "required_points";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "points" SET DEFAULT 100;--> statement-breakpoint
ALTER TABLE "user_checkins" ALTER COLUMN "points_earned" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "membership_type" varchar(50) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "membership_expiry" date;--> statement-breakpoint
ALTER TABLE "processing_tasks" ADD COLUMN "has_been_downloaded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD COLUMN "redeem_code_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_redeem_code_id_redeem_codes_id_fk" FOREIGN KEY ("redeem_code_id") REFERENCES "redeem_codes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "processing_tasks" DROP COLUMN IF EXISTS "progress_percent";--> statement-breakpoint
ALTER TABLE "processing_tasks" DROP COLUMN IF EXISTS "actual_points_used";