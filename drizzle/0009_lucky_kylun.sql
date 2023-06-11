ALTER TABLE "apartments_for_rent" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "apartments_for_sale" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "houses_for_rent" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "houses_for_sale" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;