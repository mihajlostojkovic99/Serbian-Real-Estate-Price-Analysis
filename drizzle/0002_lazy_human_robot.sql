DROP INDEX IF EXISTS "idx_apartments_for_rent_url";
DROP INDEX IF EXISTS "idx_apartments_for_rent_original_id";
DROP INDEX IF EXISTS "idx_apartments_for_sale_url";
DROP INDEX IF EXISTS "idx_apartments_for_sale_original_id";
DROP INDEX IF EXISTS "idx_houses_for_rent_url";
DROP INDEX IF EXISTS "idx_houses_for_rent_original_id";
DROP INDEX IF EXISTS "idx_houses_for_sale_url";
DROP INDEX IF EXISTS "idx_houses_for_sale_original_id";
CREATE UNIQUE INDEX IF NOT EXISTS "idx_apartments_for_rent_url_original_id" ON "apartments_for_rent" ("url","original_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_apartments_for_sale_url_original_id" ON "apartments_for_sale" ("url","original_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_houses_for_rent_url_original_id" ON "houses_for_rent" ("url","original_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_houses_for_sale_url_original_id" ON "houses_for_sale" ("url","original_id");