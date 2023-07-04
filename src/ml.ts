import { normalize } from './data/normalize.ts'
import { fetchFormattedData } from './data/prepare-data.ts'
import { trainTestSplit } from './data/train-test-split.ts'
import { LinearRegressionGradientDescent } from './models/linear-regression.ts'

export async function ml() {
  const data = await fetchFormattedData()

  const { meanPrice, stdPrice } = await normalize(data)

  const { train, test } = trainTestSplit(data, 8)

  const lrgd = new LinearRegressionGradientDescent(train)

  const { coefficients, maeHistory } = lrgd.performGradientDescent(2000, { meanPrice, stdPrice })

  console.log('********* COEFFICIENTS ->', coefficients)

  const result = lrgd.predict(test, { meanPrice, stdPrice })

  console.log('***** MAE last 100', maeHistory.slice(-100))
  console.log('MAE minimum: ', Math.min(...maeHistory))
  console.log('MAE actual: ', maeHistory[maeHistory.length - 1])

  return coefficients
}
