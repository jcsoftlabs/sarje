ALTER TABLE "shipping_methods" ADD COLUMN "countries" text;--> statement-breakpoint
ALTER TABLE "shipping_methods" ADD COLUMN "min_subtotal_cents" integer;--> statement-breakpoint
ALTER TABLE "shipping_methods" ADD COLUMN "max_subtotal_cents" integer;