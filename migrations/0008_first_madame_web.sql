ALTER TABLE "video" ALTER COLUMN "duration" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "video" ALTER COLUMN "duration" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "video" ADD COLUMN "visibility" text DEFAULT 'private' NOT NULL;