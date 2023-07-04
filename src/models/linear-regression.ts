import { FormattedData } from 'src/data/prepare-data'
import _ from 'lodash'

export class LinearRegressionGradientDescent {
  private coefficients: Record<keyof Omit<FormattedData, 'price' | 'id'>, number> & { intercept: number } = {
    intercept: 0,
    mlBelgradeDistance: 0,
    numOfRooms: 0,
    numOfBathrooms: 0,
    sqMeters: 0,
    yearBuilt: 0,
    floor: 0,
    totalFloors: 0,
    registered: 0,
    floorHeating: 0,
    heatPumpHeating: 0,
    centralHeating: 0,
    electricHeating: 0,
    solidFuelHeating: 0,
    gasHeating: 0,
    thermalStorage: 0,
    airCon: 0,
    parking: 0,
    elevator: 0,
    garage: 0,
    balcony: 0,
    basement: 0,
    pool: 0,
    garden: 0,
    reception: 0,
  }
  private maeHistory: number[] = []
  constructor(private readonly data: FormattedData[]) {}

  private updateMaeHistory({ meanPrice, stdPrice }: { meanPrice: number; stdPrice: number }) {
    let errors = []
    for (const row of this.data) {
      let prediction = 0
      for (const coeff in this.coefficients) {
        if (coeff === 'intercept') {
          prediction += this.coefficients[coeff]
        } else {
          prediction +=
            this.coefficients[coeff as keyof Omit<FormattedData, 'price' | 'id'>] *
            row[coeff as keyof Omit<FormattedData, 'price' | 'id'>]
        }
      }
      // const error = Math.pow(Math.abs(row.price - prediction) * stdPrice + meanPrice, 2)
      const error = Math.abs(row.price * stdPrice + meanPrice - (prediction * stdPrice + meanPrice))
      errors.push(error)
    }
    // this.mseHistory.push(Math.pow(errors.reduce((prev, curr) => prev + curr) / errors.length, 1 / 2))
    this.maeHistory.push(errors.reduce((prev, curr) => prev + curr) / errors.length)
  }

  private gradientDescentStep(learningRate: number) {
    for (const row of this.data) {
      const y = row.price
      const features = _.omit(row, 'price')

      let prediction = 0
      for (const coeff in this.coefficients) {
        if (coeff === 'intercept') {
          prediction += this.coefficients[coeff]
        } else {
          prediction +=
            this.coefficients[coeff as keyof Omit<FormattedData, 'price' | 'id'>] *
            features[coeff as keyof Omit<FormattedData, 'price' | 'id'>]
        }
      }

      const error = prediction - y
      for (const coeff in this.coefficients) {
        if (coeff === 'intercept') {
          this.coefficients[coeff] -= error * learningRate
        } else {
          this.coefficients[coeff as keyof Omit<FormattedData, 'price' | 'id'>] -=
            error * features[coeff as keyof Omit<FormattedData, 'price' | 'id'>] * learningRate
        }
      }
    }
  }

  shuffleData() {
    for (let i = this.data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.data[i], this.data[j]] = [this.data[j], this.data[i]]
    }
  }

  performGradientDescent(iterations: number, priceInfo: { meanPrice: number; stdPrice: number }, learningRate = 0.001) {
    console.log('STARTING GRADIENT DESCENT...')
    for (let i = 0; i < iterations; i++) {
      this.shuffleData()
      this.gradientDescentStep(learningRate)
      this.updateMaeHistory(priceInfo)
    }

    return { coefficients: this.coefficients, maeHistory: this.maeHistory }
  }

  predict(testData: FormattedData[], { meanPrice, stdPrice }: { meanPrice: number; stdPrice: number }) {
    let mae = 0
    for (const row of testData) {
      const y = row.price
      const features = _.omit(row, 'price')

      let prediction = 0
      for (const coeff in this.coefficients) {
        if (coeff === 'intercept') {
          prediction += this.coefficients[coeff]
        } else {
          prediction +=
            this.coefficients[coeff as keyof Omit<FormattedData, 'price' | 'id'>] *
            features[coeff as keyof Omit<FormattedData, 'price' | 'id'>]
        }
      }
      mae += Math.abs(prediction * stdPrice + meanPrice - (y * stdPrice + meanPrice))

      return { prediction: prediction, actual: y }
    }
    mae /= testData.length

    console.log('****** MAE:', mae)

    return mae
  }
}
