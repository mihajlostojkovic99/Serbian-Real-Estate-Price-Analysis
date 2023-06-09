import { and, eq, gte, inArray, isNull, lt, notInArray, or } from 'drizzle-orm'
import { db } from './db/drizzle.ts'
// import { PgDialect } from 'drizzle-orm/pg-core'
import { property } from './db/schema.ts'
import { distances, mlMunicipalities } from './util/municipalities.ts'

// const pgDialect = new PgDialect()

export async function cleanup() {
  console.log('Starting cleanup...')

  // Removing undefined values
  const rmNulls = db
    .update(property)
    .set({
      enabled: false,
    })
    .where(
      or(
        isNull(property.city),
        notInArray(property.country, ['Srbija']),
        isNull(property.numOfRooms),
        isNull(property.sqMeters),
        and(eq(property.type, 'apartment'), isNull(property.floor)),
      ),
    )
  const nullsRes = await rmNulls
  console.log(`+ Removed ${nullsRes.count} undefined values, the generated query was: `, rmNulls.toSQL())

  // Removing outliers
  const rmOutliers = db
    .update(property)
    .set({
      enabled: false,
    })
    .where(
      or(
        gte(property.numOfRooms, '20'),
        lt(property.floor, -1),
        lt(property.totalFloors, 0),
        gte(property.totalFloors, 43),
        gte(property.landArea, '220'),
        and(
          eq(property.type, 'apartment'),
          or(
            gte(property.sqMeters, '600'),
            gte(property.numOfRooms, '10'),
            gte(property.numOfBathrooms, 6),
            isNull(property.municipality),
          ),
        ),
        and(eq(property.type, 'house'), gte(property.sqMeters, '6500')),
      ),
    )
  const outliersRes = await rmOutliers
  console.log(`+ Removed ${outliersRes.count} outliers, the generated query was: `, rmOutliers.toSQL())

  // modify Belgrade municipalities
  console.log('Preparation for training...')
  console.log('Inserting additional distances and municipality info for Belgrade...')
  const distanceQueries = Object.keys(distances).map(async (key) => {
    return db
      .update(property)
      .set({ mlBelgradeDistance: distances[key].toString() })
      .where(eq(property.municipality, key))
  })
  const bgMunicipalities = mlMunicipalities.map((municipality) => {
    return db
      .update(property)
      .set({ mlMunicipality: municipality.municipality })
      .where(inArray(property.municipality, municipality.sublocations))
  })

  await Promise.all([...distanceQueries, ...bgMunicipalities])

  console.log('+++ Cleanup and preparation for training finished successfully!')
}
