CREATE TABLE "video_reaction" (
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "video_reaction_pk" PRIMARY KEY("user_id","video_id")
);
--> statement-breakpoint
ALTER TABLE "video_view" DROP CONSTRAINT "video_views_pk";--> statement-breakpoint
ALTER TABLE "video_view" ADD CONSTRAINT "video_view_pk" PRIMARY KEY("user_id","video_id");--> statement-breakpoint
ALTER TABLE "video_reaction" ADD CONSTRAINT "video_reaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_reaction" ADD CONSTRAINT "video_reaction_video_id_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE cascade ON UPDATE no action;