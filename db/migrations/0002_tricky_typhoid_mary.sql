ALTER TABLE "notifications" DROP CONSTRAINT "notifications_task_id_processing_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "task_id" SET DATA TYPE varchar(255);