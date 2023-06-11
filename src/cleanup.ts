import { and, eq, isNull, or } from 'drizzle-orm'
import { db } from './db/drizzle.ts'
import { apartmentsForRent, apartmentsForSale, housesForRent, housesForSale } from './db/schema.ts'
import { PgDialect } from 'drizzle-orm/pg-core'

const pgDialect = new PgDialect()

export async function cleanup() {
  console.log('Starting cleanup...')
  const queryApartmentsForSale = db
    .update(apartmentsForSale)
    .set({ enabled: false })
    .where(
      or(
        isNull(apartmentsForSale.numOfRooms),
        isNull(apartmentsForSale.city),
        isNull(apartmentsForSale.sqMeters),
        isNull(apartmentsForSale.floor),
      ),
    )

  const queryApartmentsForRent = db
    .update(apartmentsForRent)
    .set({ enabled: false })
    .where(
      or(
        isNull(apartmentsForRent.numOfRooms),
        isNull(apartmentsForRent.city),
        isNull(apartmentsForRent.sqMeters),
        isNull(apartmentsForRent.floor),
      ),
    )

  const queryHousesForRent = db
    .update(housesForRent)
    .set({ enabled: false })
    .where(or(isNull(housesForRent.numOfRooms), isNull(housesForRent.city), isNull(housesForRent.sqMeters)))

  const queryHousesForSale = db
    .update(housesForSale)
    .set({ enabled: false })
    .where(or(isNull(housesForSale.numOfRooms), isNull(housesForSale.city), isNull(housesForSale.sqMeters)))

  const sqlApartmentsForSale = pgDialect.sqlToQuery(queryApartmentsForSale.getSQL()).sql
  const sqlApartmentsForRent = pgDialect.sqlToQuery(queryApartmentsForRent.getSQL()).sql
  const sqlHousesForRent = pgDialect.sqlToQuery(queryHousesForRent.getSQL()).sql
  const sqlHousesForSale = pgDialect.sqlToQuery(queryHousesForSale.getSQL()).sql

  console.log('Generated SQLs for this cleanup are: ')
  console.log(sqlApartmentsForSale)
  console.log(sqlApartmentsForRent)
  console.log(sqlHousesForRent)
  console.log(sqlHousesForSale)
  const [resApartmentsForSale, resApartmentsForRent, resHousesForRent, resHousesForSale] = await Promise.all([
    queryApartmentsForSale,
    queryApartmentsForRent,
    queryHousesForRent,
    queryHousesForSale,
  ])
  console.log(`Found ${resApartmentsForSale.count} dirty rows from ApartmentsForSale. Soft deletion performed on them.`)
  console.log(`Found ${resApartmentsForRent.count} dirty rows from ApartmentsForRent. Soft deletion performed on them.`)
  console.log(`Found ${resHousesForRent.count} dirty rows from HousesForRent. Soft deletion performed on them.`)
  console.log(`Found ${resHousesForSale.count} dirty rows from HousesForSale. Soft deletion performed on them.`)
}
