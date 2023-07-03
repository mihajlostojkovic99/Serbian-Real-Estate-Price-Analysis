import 'dotenv/config.js'
import { RequestOptions, Configuration, CheerioCrawler } from 'crawlee'
import { chromium } from 'playwright-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrationClient } from './db/drizzle.ts'
import { router } from './routes.ts'
import { cleanup } from './cleanup.ts'
import { exit } from 'process'
import { fetchFormattedData } from './data/prepare-data.ts'
import { normalize } from './data/normalize.ts'
import { trainTestSplit } from './data/train-test-split.ts'
import { LinearRegressionGradientDescent } from './models/linear-regression.ts'

const startUrls: RequestOptions[] = [
  {
    // Apartments for sale 1-100_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/1_100000/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Apartments for sale 100_000-150_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/100000_150000/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Apartments for sale 150_000-300_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/150000_300000/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Apartments for sale 300_000-30_000_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/300000_30000000/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Apartments for renting
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/izdavanje/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Houses for sale
    url: 'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/prodaja/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Houses for renting
    url: 'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/izdavanje/lista/po-stranici/20/',
    label: 'LIST',
  },
]

const config = new Configuration({
  availableMemoryRatio: 0.7,
  purgeOnStart: false,
  persistStorage: true,
})

chromium.use(stealthPlugin())

const crawler = new CheerioCrawler(
  {
    requestHandler: router,
    // maxRequestsPerCrawl: 5,
    maxRequestsPerMinute: 60,
    requestHandlerTimeoutSecs: 60 * 3,
  },
  config,
)

// run db migrations
// await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' })

// start crawling
// await crawler.run(startUrls)

// discard properties with not enough info and outliers
// await cleanup()

const data = await fetchFormattedData()

const { meanPrice, stdPrice } = await normalize(data)

const { train, test } = trainTestSplit(data, 5)

const lrgd = new LinearRegressionGradientDescent(train)

const { coefficients, mseHistory } = lrgd.performGradientDescent(1000)

console.log('********* COEFFICIENTS ->', coefficients)

const result = lrgd.predict(test)

const denormalizedResult = result.map((item) => {
  const prediction = item.prediction * stdPrice + meanPrice
  const actual = item.actual * stdPrice + meanPrice
  return {
    prediction,
    actual,
    diff: Math.abs(prediction - actual),
  }
})

console.log('MSE minimum: ', Math.min(...mseHistory))
console.log('MSE actual: ', mseHistory[mseHistory.length - 1])

// console.log('********* RESULT ->', denormalizedResult)
// console.log('tmp: ', meanPrice, stdPrice)

exit()
