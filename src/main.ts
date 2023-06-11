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
    // TMP FIX, Houses for sale
    url: 'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/prodaja/lista/po-stranici/20/stranica/52/',
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
  // maxUsedCpuRatio: 0.95,
  purgeOnStart: false,
  persistStorage: true,
})

chromium.use(stealthPlugin())

const crawler = new PlaywrightCrawler(
  {
    requestHandler: router,
    maxRequestsPerCrawl: 25000,
    maxRequestsPerMinute: 25,
    maxConcurrency: 1,
    requestHandlerTimeoutSecs: 60 * 3,
    launchContext: {
      launcher: chromium,
      userDataDir: './userDataDir',
      launchOptions: {
        // headless: false, // for debugging
        args: [
          '--disable-gpu',
          '--disable-accelerated-2d-canvas',
          '--autoplay-policy=user-gesture-required',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-default-apps',
          '--disable-dev-shm-usage',
          '--disable-domain-reliability',
          '--disable-extensions',
          '--disable-features=AudioServiceOutOfProcess',
          '--disable-hang-monitor',
          '--disable-ipc-flooding-protection',
          '--disable-notifications',
          '--disable-offer-store-unmasked-wallet-cards',
          '--disable-popup-blocking',
          '--disable-print-preview',
          '--disable-prompt-on-repost',
          '--disable-renderer-backgrounding',
          '--disable-setuid-sandbox',
          '--disable-speech-api',
          '--disable-sync',
          '--hide-scrollbars',
          '--ignore-gpu-blacklist',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-first-run',
          '--no-pings',
          '--no-sandbox',
          '--no-zygote',
          '--password-store=basic',
          '--use-gl=swiftshader',
          '--use-mock-keychain',
        ],
      },
    },
  },
  config,
)

// run db migrations
await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' })

// start crawling
await crawler.run(startUrls)
