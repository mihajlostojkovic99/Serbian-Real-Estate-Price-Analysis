DO $$ BEGIN
 CREATE TYPE "property_type" AS ENUM('house', 'apartment');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_id" varchar(14),
	"url" varchar(255),
	"date_updated" date,
	"date_created" date,
	"date_scraped" date DEFAULT now() NOT NULL,
	"title" text,
	"for_sale" boolean NOT NULL,
	"type" "property_type" NOT NULL,
	"country" varchar(255),
	"region" varchar(255),
	"city" varchar(255),
	"municipality" varchar(255),
	"street" varchar(255),
	"num_of_rooms" numeric,
	"num_of_bathrooms" integer,
	"sq_meters" numeric,
	"land_area" numeric,
	"year_built" integer,
	"floor" integer,
	"total_floors" integer,
	"registration" boolean DEFAULT false,
	"floor_heating" boolean DEFAULT false,
	"heat_pump_heating" boolean DEFAULT false,
	"central_heating" boolean DEFAULT false,
	"electric_heating" boolean DEFAULT false,
	"solid_fuel_heating" boolean DEFAULT false,
	"gas_heating" boolean DEFAULT false,
	"thermal_storage" boolean DEFAULT false,
	"air_con" boolean DEFAULT false,
	"parking" boolean DEFAULT false,
	"garage" boolean DEFAULT false,
	"elevator" boolean DEFAULT false,
	"balcony" boolean DEFAULT false,
	"basement" boolean DEFAULT false,
	"pool" boolean DEFAULT false,
	"garden" boolean DEFAULT false,
	"reception" boolean DEFAULT false,
	"price" numeric NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_property_url" ON "property" ("url");