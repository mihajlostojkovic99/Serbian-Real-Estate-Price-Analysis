import { FormattedData } from './prepare-data'

export function shuffleArray(array: FormattedData[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export function trainTestSplit(data: FormattedData[], testSize: number, shuffle = true) {
  data.sort((a, b) => a.price - b.price)

  const train: FormattedData[] = []
  const test: FormattedData[] = []

  for (let i = 0; i < data.length; i++) {
    if (i % testSize === 0) {
      test.push(data[i])
    } else {
      train.push(data[i])
    }
  }

  // const trainSize = Math.floor(data.length * (1 - testSize))
  // const train = data.slice(0, trainSize)
  // const test = data.slice(trainSize)
  if (shuffle) {
    shuffleArray(train)
  }
  return { train, test }
}
