ALTER TABLE "deck" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "original_deck_id" uuid;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "fork_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_original_deck_id_deck_id_fk" FOREIGN KEY ("original_deck_id") REFERENCES "public"."deck"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deck_isPublic_idx" ON "deck" USING btree ("is_public");