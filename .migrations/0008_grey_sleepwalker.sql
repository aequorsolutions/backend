ALTER TABLE "categories" DROP CONSTRAINT "categories_owners_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_teams_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN IF EXISTS "owners_id";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN IF EXISTS "teams_id";