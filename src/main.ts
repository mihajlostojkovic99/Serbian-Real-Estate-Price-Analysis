import 'dotenv/config.js'
import { PlaywrightCrawler, RequestOptions, Configuration } from 'crawlee'
import { chromium } from 'playwright-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrationClient } from './db/drizzle.ts'
import { router } from './routes.ts'

const startUrls: RequestOptions[] = [
  {
    // Apartments for sale
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/lista/po-stranici/20/',
    label: 'HOMEPAGE',
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
  availableMemoryRatio: 0.5,
  maxUsedCpuRatio: 0.8,
  purgeOnStart: false,
  persistStorage: true,
})

chromium.use(stealthPlugin())

const crawler = new PlaywrightCrawler(
  {
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
    maxRequestsPerCrawl: 20500,
    maxRequestsPerMinute: 20,
    requestHandlerTimeoutSecs: 60 * 5,
    launchContext: {
      launcher: chromium,
      // launchOptions: {
      //   headless: false, // for debugging
      // },
    },
  },
  config,
)

// run db migrations
await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' })

// start crawling
await crawler.run(startUrls)
