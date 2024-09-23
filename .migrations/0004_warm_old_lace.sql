ALTER TABLE "categories" ADD COLUMN "owners_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "teams_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_owners_id_users_id_fk" FOREIGN KEY ("owners_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_teams_id_teams_id_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
