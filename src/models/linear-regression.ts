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
  private mseHistory: number[] = []
  constructor(private readonly data: FormattedData[]) {}

  private updateMseHistory() {
    let errors = []
    for (const row of this.data) {
      let predicted = 0
      for (const coeff in this.coefficients) {
        if (coeff === 'intercept') {
          predicted += this.coefficients[coeff]
        } else {
          predicted +=
            this.coefficients[coeff as keyof Omit<FormattedData, 'price' | 'id'>] *
            row[coeff as keyof Omit<FormattedData, 'price' | 'id'>]
        }
      }
      const error = Math.pow(row.price - predicted, 2)
      errors.push(error)
    }
    this.mseHistory.push((errors.reduce((prev, curr) => prev + curr) / errors.length) * 0.5)
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

      const error = y - prediction
      for (const coeff in this.coefficients) {
        if (coeff === 'intercept') {
          this.coefficients[coeff] += error * learningRate
        } else {
          this.coefficients[coeff as keyof Omit<FormattedData, 'price' | 'id'>] +=
            error * features[coeff as keyof Omit<FormattedData, 'price' | 'id'>] * learningRate
        }
      }
    }
  }

  performGradientDescent(iterations: number, learningRate = 0.005) {
    console.log('STARTING GRADIENT DESCENT...')
    for (let i = 0; i < iterations; i++) {
      this.gradientDescentStep(learningRate)
      this.updateMseHistory()
    }

    return { coefficients: this.coefficients, mseHistory: this.mseHistory }
  }

  predict(testData: FormattedData[]) {
    return testData.map((row) => {
      const y = row.price
      const features = _.omit(row, 'price')

      let price = 0
      for (const coeff in this.coefficients) {
        if (coeff === 'intercept') {
          price += this.coefficients[coeff]
        } else {
          price +=
            this.coefficients[coeff as keyof Omit<FormattedData, 'price' | 'id'>] *
            features[coeff as keyof Omit<FormattedData, 'price' | 'id'>]
        }
      }

      return { prediction: price, actual: y }
    })
  }
}
