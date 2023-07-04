import { FormattedData } from './data/prepare-data.ts'
import { db } from './db/drizzle.ts'
import { LinearRegressionInsert, linearRegression } from './db/schema.ts'

export async function updateCoefficients(
  coefficients: Record<keyof Omit<FormattedData, 'price' | 'id'>, number> & { intercept: number },
) {
  const stringCoefficients: LinearRegressionInsert = {
    intercept: coefficients.intercept.toString(),
    airCon: coefficients.airCon.toString(),
    balcony: coefficients.balcony.toString(),
    basement: coefficients.basement.toString(),
    elevator: coefficients.elevator.toString(),
    floor: coefficients.floor.toString(),
    centralHeating: coefficients.centralHeating.toString(),
    electricHeating: coefficients.electricHeating.toString(),
    floorHeating: coefficients.floorHeating.toString(),
    garage: coefficients.garage.toString(),
    garden: coefficients.garden.toString(),
    gasHeating: coefficients.gasHeating.toString(),
    heatPumpHeating: coefficients.heatPumpHeating.toString(),
    mlBelgradeDistance: coefficients.mlBelgradeDistance.toString(),
    numOfBathrooms: coefficients.numOfBathrooms.toString(),
    numOfRooms: coefficients.numOfRooms.toString(),
    parking: coefficients.parking.toString(),
    pool: coefficients.pool.toString(),
    reception: coefficients.reception.toString(),
    registered: coefficients.registered.toString(),
    solidFuelHeating: coefficients.solidFuelHeating.toString(),
    sqMeters: coefficients.sqMeters.toString(),
    thermalStorage: coefficients.thermalStorage.toString(),
    totalFloors: coefficients.totalFloors.toString(),
    yearBuilt: coefficients.yearBuilt.toString(),
  }

  await db.insert(linearRegression).values(stringCoefficients)
}
