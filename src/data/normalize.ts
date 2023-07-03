import { and, eq, isNotNull, sql } from 'drizzle-orm'
import { db } from '../db/drizzle.ts'
import { property } from '../db/schema.ts'

const seriesNames = [
  'mlBelgradeDistance',
  'numOfRooms',
  'numOfBathrooms',
  'sqMeters',
  'yearBuilt',
  'floor',
  'totalFloors',
  'price',
] as const

type NumberValues = {
  [K in (typeof seriesNames)[number]]: number
}

export async function normalize<T extends NumberValues>(data: T[]) {
  const factors = await Promise.all(
    seriesNames.map(async (name) => {
      const minQuery = db
        .select({ min: sql<number>`MIN(${property[name]})` })
        .from(property)
        .where(
          and(
            eq(property.enabled, true),
            eq(property.type, 'apartment'),
            eq(property.forSale, true),
            isNotNull(property.mlMunicipality),
          ),
        )
      const maxQuery = db
        .select({ max: sql<number>`MAX(${property[name]})` })
        .from(property)
        .where(
          and(
            eq(property.enabled, true),
            eq(property.type, 'apartment'),
            eq(property.forSale, true),
            isNotNull(property.mlMunicipality),
          ),
        )

      const [min, max] = await Promise.all([minQuery, maxQuery])

      return { name, min: min[0].min, max: max[0].max }
    }),
  )

  data.forEach((row) => {
    factors.forEach(({ name, min, max }) => {
      row[name] = (row[name] - min) / (max - min)
    })
  })
}
