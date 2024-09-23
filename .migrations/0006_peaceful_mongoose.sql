ALTER TABLE "goals" ADD COLUMN "teams_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_teams_id_teams_id_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
