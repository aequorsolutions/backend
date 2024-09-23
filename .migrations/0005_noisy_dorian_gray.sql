ALTER TABLE "goals" RENAME COLUMN "desired_weekly_frequency" TO "desired_frequency";--> statement-breakpoint
ALTER TABLE "goal_completions" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "owners_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_completions" ADD CONSTRAINT "goal_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_owners_id_users_id_fk" FOREIGN KEY ("owners_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
