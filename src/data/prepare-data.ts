import { and, eq, isNotNull, sql } from 'drizzle-orm'
import { db } from '../db/drizzle.ts'
import { property } from '../db/schema.ts'

export async function fetchFormattedData() {
  const apartments = await db
    .select({
      id: property.id,
      mlBelgradeDistance: property.mlBelgradeDistance,
      numOfRooms: property.numOfRooms,
      numOfBathrooms: property.numOfBathrooms,
      sqMeters: property.sqMeters,
      yearBuilt: property.yearBuilt,
      floor: property.floor,
      totalFloors: property.totalFloors,
      registered: sql<number>`CASE WHEN ${property.registered} = 'true' THEN 1 ELSE 0 END`,
      floorHeating: sql<number>`CASE WHEN ${property.floorHeating} = 'true' THEN 1 ELSE 0 END`,
      heatPumpHeating: sql<number>`CASE WHEN ${property.heatPumpHeating} = 'true' THEN 1 ELSE 0 END`,
      centralHeating: sql<number>`CASE WHEN ${property.centralHeating} = 'true' THEN 1 ELSE 0 END`,
      electricHeating: sql<number>`CASE WHEN ${property.electricHeating} = 'true' THEN 1 ELSE 0 END`,
      solidFuelHeating: sql<number>`CASE WHEN ${property.solidFuelHeating} = 'true' THEN 1 ELSE 0 END`,
      gasHeating: sql<number>`CASE WHEN ${property.gasHeating} = 'true' THEN 1 ELSE 0 END`,
      thermalStorage: sql<number>`CASE WHEN ${property.thermalStorage} = 'true' THEN 1 ELSE 0 END`,
      airCon: sql<number>`CASE WHEN ${property.airCon} = 'true' THEN 1 ELSE 0 END`,
      parking: sql<number>`CASE WHEN ${property.parking} = 'true' THEN 1 ELSE 0 END`,
      elevator: sql<number>`CASE WHEN ${property.elevator} = 'true' THEN 1 ELSE 0 END`,
      garage: sql<number>`CASE WHEN ${property.garage} = 'true' THEN 1 ELSE 0 END`,
      balcony: sql<number>`CASE WHEN ${property.balcony} = 'true' THEN 1 ELSE 0 END`,
      basement: sql<number>`CASE WHEN ${property.basement} = 'true' THEN 1 ELSE 0 END`,
      pool: sql<number>`CASE WHEN ${property.pool} = 'true' THEN 1 ELSE 0 END`,
      garden: sql<number>`CASE WHEN ${property.garden} = 'true' THEN 1 ELSE 0 END`,
      reception: sql<number>`CASE WHEN ${property.reception} = 'true' THEN 1 ELSE 0 END`,
      price: property.price,
    })
    .from(property)
    .where(
      and(
        eq(property.enabled, true),
        eq(property.type, 'apartment'),
        eq(property.forSale, true),
        isNotNull(property.mlMunicipality),
      ),
    )

  const bathroomsQuery = db
    .select({ mean: sql<number>`AVG(${property.numOfBathrooms})` })
    .from(property)
    .where(
      and(
        eq(property.enabled, true),
        eq(property.type, 'apartment'),
        eq(property.forSale, true),
        isNotNull(property.mlMunicipality),
      ),
    )
    .limit(1)

  const floorsQuery = db
    .select({ mean: sql<number>`AVG(${property.totalFloors})` })
    .from(property)
    .where(
      and(
        eq(property.enabled, true),
        eq(property.type, 'apartment'),
        eq(property.forSale, true),
        isNotNull(property.mlMunicipality),
      ),
    )
    .limit(1)

  const yearsQuery = db
    .select({ mean: sql<number>`AVG(${property.yearBuilt})` })
    .from(property)
    .where(
      and(
        eq(property.enabled, true),
        eq(property.type, 'apartment'),
        eq(property.forSale, true),
        isNotNull(property.mlMunicipality),
      ),
    )
    .limit(1)

  const [bathroomsRes, floorsRes, yearsRes] = await Promise.all([bathroomsQuery, floorsQuery, yearsQuery])

  const numOfBathroomsMean = Math.round(bathroomsRes[0].mean)
  const totalFloorsMean = Math.round(floorsRes[0].mean)
  const yearBuiltMean = Math.round(yearsRes[0].mean)

  apartments.forEach((apartment) => {
    if (apartment.numOfBathrooms === null) {
      apartment.numOfBathrooms = numOfBathroomsMean
    }
    if (apartment.totalFloors === null) {
      apartment.totalFloors = totalFloorsMean
    }
    if (apartment.yearBuilt === null) {
      apartment.yearBuilt = yearBuiltMean
    }
  })

  return apartments.map((apartment) => {
    return {
      ...apartment,
      numOfBathrooms: apartment.numOfBathrooms ?? numOfBathroomsMean,
      floor: apartment.floor!,
      totalFloors: apartment.totalFloors ?? totalFloorsMean,
      yearBuilt: apartment.yearBuilt ?? yearBuiltMean,
      mlBelgradeDistance: +apartment.mlBelgradeDistance!,
      sqMeters: +apartment.sqMeters!,
      numOfRooms: +apartment.numOfRooms!,
      price: +apartment.price!,
    }
  })
}
