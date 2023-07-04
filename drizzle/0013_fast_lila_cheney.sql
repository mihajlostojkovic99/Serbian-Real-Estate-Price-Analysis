CREATE TABLE IF NOT EXISTS "linear_regression" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_scraped" date DEFAULT now() NOT NULL,
	"ml_belgrade_distance" numeric,
	"num_of_rooms" numeric,
	"num_of_bathrooms" numeric,
	"sq_meters" numeric,
	"year_built" numeric,
	"floor" numeric,
	"total_floors" numeric,
	"registration" numeric,
	"floor_heating" numeric,
	"heat_pump_heating" numeric,
	"central_heating" numeric,
	"electric_heating" numeric,
	"solid_fuel_heating" numeric,
	"gas_heating" numeric,
	"thermal_storage" numeric,
	"air_con" numeric,
	"parking" numeric,
	"garage" numeric,
	"elevator" numeric,
	"balcony" numeric,
	"basement" numeric,
	"pool" numeric,
	"garden" numeric,
	"reception" numeric
);
