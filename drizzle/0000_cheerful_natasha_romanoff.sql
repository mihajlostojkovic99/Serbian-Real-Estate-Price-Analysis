CREATE TABLE IF NOT EXISTS "apartments_for_rent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_id" varchar(14),
	"url" varchar(255),
	"title" text,
	"location" varchar(255),
	"sq_meters" integer,
	"year_built" integer,
	"floor" integer,
	"total_floors" integer,
	"registration" boolean,
	"floor_heating" boolean,
	"central_heating" boolean,
	"electric_heating" boolean,
	"solid_fuel_heating" boolean,
	"gas_heating" boolean,
	"thermal_storage" boolean,
	"air_con" boolean,
	"num_of_rooms" integer,
	"num_of_bathrooms" integer,
	"parking" boolean,
	"garage" boolean,
	"elevator" boolean,
	"balcony" boolean,
	"basement" boolean,
	"pool" boolean,
	"garden" boolean,
	"reception" boolean,
	"price" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "apartments_for_sale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_id" varchar(14),
	"url" varchar(255),
	"title" text,
	"location" varchar(255),
	"sq_meters" integer,
	"year_built" integer,
	"floor" integer,
	"total_floors" integer,
	"registration" boolean,
	"floor_heating" boolean,
	"central_heating" boolean,
	"electric_heating" boolean,
	"solid_fuel_heating" boolean,
	"gas_heating" boolean,
	"thermal_storage" boolean,
	"air_con" boolean,
	"num_of_rooms" integer,
	"num_of_bathrooms" integer,
	"parking" boolean,
	"garage" boolean,
	"elevator" boolean,
	"balcony" boolean,
	"basement" boolean,
	"pool" boolean,
	"garden" boolean,
	"reception" boolean,
	"price" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "houses_for_rent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_id" varchar(14),
	"url" varchar(255),
	"title" text,
	"location" varchar(255),
	"sq_meters" integer,
	"land_area" integer,
	"year_built" integer,
	"total_floors" integer,
	"registration" boolean,
	"floor_heating" boolean,
	"central_heating" boolean,
	"electric_heating" boolean,
	"solid_fuel_heating" boolean,
	"gas_heating" boolean,
	"thermal_storage" boolean,
	"air_con" boolean,
	"num_of_rooms" integer,
	"num_of_bathrooms" integer,
	"parking" boolean,
	"garage" boolean,
	"elevator" boolean,
	"balcony" boolean,
	"basement" boolean,
	"pool" boolean,
	"garden" boolean,
	"reception" boolean,
	"price" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "houses_for_sale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_id" varchar(14),
	"url" varchar(255),
	"title" text,
	"location" varchar(255),
	"sq_meters" integer,
	"land_area" integer,
	"year_built" integer,
	"total_floors" integer,
	"registration" boolean,
	"floor_heating" boolean,
	"central_heating" boolean,
	"electric_heating" boolean,
	"solid_fuel_heating" boolean,
	"gas_heating" boolean,
	"thermal_storage" boolean,
	"air_con" boolean,
	"num_of_rooms" integer,
	"num_of_bathrooms" integer,
	"parking" boolean,
	"garage" boolean,
	"elevator" boolean,
	"balcony" boolean,
	"basement" boolean,
	"pool" boolean,
	"garden" boolean,
	"reception" boolean,
	"price" integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_apartments_for_rent_url" ON "apartments_for_rent" ("url");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_apartments_for_rent_original_id" ON "apartments_for_rent" ("original_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_apartments_for_sale_url" ON "apartments_for_sale" ("url");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_apartments_for_sale_original_id" ON "apartments_for_sale" ("original_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_houses_for_rent_url" ON "houses_for_rent" ("url");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_houses_for_rent_original_id" ON "houses_for_rent" ("original_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_houses_for_sale_url" ON "houses_for_sale" ("url");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_houses_for_sale_original_id" ON "houses_for_sale" ("original_id");