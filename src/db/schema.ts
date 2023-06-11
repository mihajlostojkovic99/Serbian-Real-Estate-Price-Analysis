import { InferModel } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
  PgTableWithColumns,
  decimal,
  date,
} from 'drizzle-orm/pg-core'

export const housesForRent = pgTable(
  'houses_for_rent',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    originalId: varchar('original_id', { length: 14 }),
    url: varchar('url', { length: 255 }),
    dateUpdated: date('date_updated', { mode: 'string' }),
    dateCreated: date('date_created', { mode: 'string' }),
    dateScraped: date('date_scraped').notNull().defaultNow(),
    title: text('title'),
    city: varchar('city', { length: 255 }),
    location: varchar('location', { length: 255 }),
    sqMeters: decimal('sq_meters'),
    landArea: decimal('land_area'),
    yearBuilt: integer('year_built'),
    totalFloors: integer('total_floors'),
    registration: boolean('registration').default(false),
    floorHeating: boolean('floor_heating').default(false),
    centralHeating: boolean('central_heating').default(false),
    electricHeating: boolean('electric_heating').default(false),
    solidFuelHeating: boolean('solid_fuel_heating').default(false),
    gasHeating: boolean('gas_heating').default(false),
    thermalStorage: boolean('thermal_storage').default(false),
    airCon: boolean('air_con').default(false),
    numOfRooms: decimal('num_of_rooms'),
    numOfBathrooms: integer('num_of_bathrooms'),
    parking: boolean('parking').default(false),
    garage: boolean('garage').default(false),
    elevator: boolean('elevator').default(false),
    balcony: boolean('balcony').default(false),
    basement: boolean('basement').default(false),
    pool: boolean('pool').default(false),
    garden: boolean('garden').default(false),
    reception: boolean('reception').default(false),
    price: decimal('price').notNull(),
    enabled: boolean('enabled').notNull().default(true),
  },
  (housesForRent) => {
    return {
      urlAndOriginalIdIndex: uniqueIndex('idx_houses_for_rent_url_original_id').on(
        housesForRent.url,
        housesForRent.originalId,
      ),
    }
  },
)
export type HousesForRent = InferModel<typeof housesForRent>
export type NewHouseForRent = InferModel<typeof housesForRent, 'insert'>

export const housesForSale = pgTable(
  'houses_for_sale',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    originalId: varchar('original_id', { length: 14 }),
    url: varchar('url', { length: 255 }),
    dateUpdated: date('date_updated', { mode: 'string' }),
    dateCreated: date('date_created', { mode: 'string' }),
    dateScraped: date('date_scraped').notNull().defaultNow(),
    title: text('title'),
    city: varchar('city', { length: 255 }),
    location: varchar('location', { length: 255 }),
    sqMeters: decimal('sq_meters'),
    landArea: decimal('land_area'),
    yearBuilt: integer('year_built'),
    totalFloors: integer('total_floors'),
    registration: boolean('registration'),
    floorHeating: boolean('floor_heating'),
    centralHeating: boolean('central_heating'),
    electricHeating: boolean('electric_heating'),
    solidFuelHeating: boolean('solid_fuel_heating'),
    gasHeating: boolean('gas_heating'),
    thermalStorage: boolean('thermal_storage'),
    airCon: boolean('air_con'),
    numOfRooms: decimal('num_of_rooms'),
    numOfBathrooms: integer('num_of_bathrooms'),
    parking: boolean('parking'),
    garage: boolean('garage'),
    elevator: boolean('elevator'),
    balcony: boolean('balcony'),
    basement: boolean('basement'),
    pool: boolean('pool'),
    garden: boolean('garden'),
    reception: boolean('reception'),
    price: decimal('price').notNull(),
    enabled: boolean('enabled').notNull().default(true),
  },
  (housesForSale) => {
    return {
      urlAndOriginalIdIndex: uniqueIndex('idx_houses_for_sale_url_original_id').on(
        housesForSale.url,
        housesForSale.originalId,
      ),
    }
  },
)
export type HousesForSale = InferModel<typeof housesForSale>
export type NewHouseForSale = InferModel<typeof housesForSale, 'insert'>

export const apartmentsForRent = pgTable(
  'apartments_for_rent',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    originalId: varchar('original_id', { length: 14 }),
    url: varchar('url', { length: 255 }),
    dateUpdated: date('date_updated', { mode: 'string' }),
    dateCreated: date('date_created', { mode: 'string' }),
    dateScraped: date('date_scraped').notNull().defaultNow(),
    title: text('title'),
    city: varchar('city', { length: 255 }),
    location: varchar('location', { length: 255 }),
    sqMeters: decimal('sq_meters'),
    yearBuilt: integer('year_built'),
    floor: integer('floor'),
    totalFloors: integer('total_floors'),
    registration: boolean('registration'),
    floorHeating: boolean('floor_heating'),
    centralHeating: boolean('central_heating'),
    electricHeating: boolean('electric_heating'),
    solidFuelHeating: boolean('solid_fuel_heating'),
    gasHeating: boolean('gas_heating'),
    thermalStorage: boolean('thermal_storage'),
    airCon: boolean('air_con'),
    numOfRooms: decimal('num_of_rooms'),
    numOfBathrooms: integer('num_of_bathrooms'),
    parking: boolean('parking'),
    garage: boolean('garage'),
    elevator: boolean('elevator'),
    balcony: boolean('balcony'),
    basement: boolean('basement'),
    pool: boolean('pool'),
    garden: boolean('garden'),
    reception: boolean('reception'),
    price: decimal('price').notNull(),
    enabled: boolean('enabled').notNull().default(true),
  },
  (apartmentsForRent) => {
    return {
      urlAndOriginalIdIndex: uniqueIndex('idx_apartments_for_rent_url_original_id').on(
        apartmentsForRent.url,
        apartmentsForRent.originalId,
      ),
    }
  },
)
export type ApartmentsForRent = InferModel<typeof apartmentsForRent>
export type NewApartmentForRent = InferModel<typeof apartmentsForRent, 'insert'>

export const apartmentsForSale = pgTable(
  'apartments_for_sale',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    originalId: varchar('original_id', { length: 14 }),
    url: varchar('url', { length: 255 }),
    dateUpdated: date('date_updated', { mode: 'string' }),
    dateCreated: date('date_created', { mode: 'string' }),
    dateScraped: date('date_scraped').notNull().defaultNow(),
    title: text('title'),
    city: varchar('city', { length: 255 }),
    location: varchar('location', { length: 255 }),
    sqMeters: decimal('sq_meters'),
    yearBuilt: integer('year_built'),
    floor: integer('floor'),
    totalFloors: integer('total_floors'),
    registration: boolean('registration'),
    floorHeating: boolean('floor_heating'),
    centralHeating: boolean('central_heating'),
    electricHeating: boolean('electric_heating'),
    solidFuelHeating: boolean('solid_fuel_heating'),
    gasHeating: boolean('gas_heating'),
    thermalStorage: boolean('thermal_storage'),
    airCon: boolean('air_con'),
    numOfRooms: decimal('num_of_rooms'),
    numOfBathrooms: integer('num_of_bathrooms'),
    parking: boolean('parking'),
    garage: boolean('garage'),
    elevator: boolean('elevator'),
    balcony: boolean('balcony'),
    basement: boolean('basement'),
    pool: boolean('pool'),
    garden: boolean('garden'),
    reception: boolean('reception'),
    price: decimal('price').notNull(),
    enabled: boolean('enabled').notNull().default(true),
  },
  (apartmentsForSale) => {
    return {
      urlAndOriginalIdIndex: uniqueIndex('idx_apartments_for_sale_url_original_id').on(
        apartmentsForSale.url,
        apartmentsForSale.originalId,
      ),
    }
  },
)
export type ApartmentsForSale = InferModel<typeof apartmentsForSale>
export type NewApartmentForSale = InferModel<typeof apartmentsForSale, 'insert'>
