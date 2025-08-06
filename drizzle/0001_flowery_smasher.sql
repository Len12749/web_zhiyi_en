ALTER TABLE "processing_tasks" RENAME COLUMN "estimated_points" TO "required_points";--> statement-breakpoint
ALTER TABLE "processing_tasks" ADD COLUMN "has_been_downloaded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "processing_tasks" DROP COLUMN IF EXISTS "actual_points_used";