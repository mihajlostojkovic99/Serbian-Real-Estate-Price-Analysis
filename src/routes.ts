import { Dataset, createPlaywrightRouter } from 'crawlee'
import { getAttribute, parseNumber } from './util/string.ts'
import { db } from './db/drizzle.ts'
import {
  NewApartmentForRent,
  NewApartmentForSale,
  NewHouseForRent,
  NewHouseForSale,
  apartmentsForRent,
  apartmentsForSale,
  housesForRent,
  housesForSale,
} from './db/schema.ts'

export const router = createPlaywrightRouter()

const MAX_PRICE = 30_000_000
const STEP = 20_000

router.use(async ({ blockRequests, request }) => {
  if (request.label !== 'HOMEPAGE') {
    await blockRequests({
      extraUrlPatterns: [
        'https://cms.nekretnine.rs/foto/**',
        'https://img.nekretnine.rs/foto/**',
        'https://www.nekretnine.rs/build/images/**',
        'https://maps-api.planplus.rs/**',
      ],
    })
  }
})

router.addHandler('HOMEPAGE', async ({ request, log, enqueueLinks, page }) => {
  page.route('**/*', (route) => {
    if (route.request().resourceType() === 'image') {
      route.abort()
    }
  })
  log.info(`Fetching price ranges on HOMEPAGE...`, { url: request.loadedUrl })

  const priceFromSelector = '#slider-range-price-from'
  const priceToSelector = '#slider-range-price-to'
  const numSelector = '#search-count-number'
  const spinnerSelector = '#search-count-loader'
  const submitSelector = '#apply-filters-btn'

  let priceFrom = 0
  let priceTo = 80000

  // choose only apartments that are being sold
  const sellingHandle = await page.$('#filter-options > div:nth-child(4) > ul > li:nth-child(2) > a')
  await sellingHandle?.click()

  while (priceTo <= MAX_PRICE) {
    // clean price input fields
    await page.fill(priceFromSelector, '')
    await page.fill(priceToSelector, '')

    await page.fill(priceFromSelector, priceFrom.toString())

    // find the new priceTo
    while (true) {
      if (priceFrom >= 160_000) {
        priceTo = MAX_PRICE
        break
      }
      await page.type(priceToSelector, priceTo.toString(), { delay: 300 })
      await page.focus(priceFromSelector)
      await page.locator(spinnerSelector).waitFor({ state: 'visible' })
      await page.locator(numSelector).waitFor({ state: 'visible' })
      const numOfProperties = await page.$eval(numSelector, (el) =>
        parseInt(el.textContent?.split(' ')[1].slice(1, -1) ?? '-1'),
      )
      if (numOfProperties === -1 || isNaN(numOfProperties)) {
        log.error('Number of properties not found on the submit button!', {
          numOfProperties,
        })
        return
      }
      if (numOfProperties < 10000) {
        priceTo += STEP
        await page.fill(priceToSelector, '')
      } else {
        priceTo -= STEP
        break
      }
    }

    //get the link for that range and push it
    await page.fill(priceToSelector, '')
    await page.fill(priceToSelector, priceTo.toString())
    await page.focus(priceFromSelector)
    await page.waitForSelector(spinnerSelector, { state: 'visible' })
    await page.waitForSelector(numSelector, { state: 'visible' })
    await enqueueLinks({ selector: submitSelector, label: 'LIST' })

    log.info(`A new price range is established! The range is from ${priceFrom} to ${priceTo}.`, {
      numOfProperties: await page.$eval(numSelector, (el) =>
        parseInt(el.textContent?.split(' ')[1].slice(1, -1) ?? '-1'),
      ),
    })

    // priceFrom is now priceTo
    priceFrom = priceTo
    priceTo += STEP
  }
})

router.addHandler('LIST', async ({ page, request, log, enqueueLinks }) => {
  if (request.url.slice(-3, -1) === '10') {
    await enqueueLinks({
      urls: [request.url.slice(0, -3).concat('20/')],
      label: 'LIST',
    })
    return
  }

  const pageNumber = await page.locator('.next-number.active').innerText()

  const filtersChosen = await page.locator('#izabrali-ste').innerText()
  log.info(`Fetching urls on "${filtersChosen}" page number ${pageNumber}...`, { url: request.loadedUrl })

  await enqueueLinks({
    selector: '.next-number',
    globs: [
      'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/izdavanje/lista/po-stranici/20/stranica/*',
      'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/prodaja/lista/po-stranici/20/stranica/*',
      'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/izdavanje/lista/po-stranici/20/stranica/*',
      'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/*/lista/po-stranici/20/stranica/*',
    ],
    label: request.label,
  })

  await enqueueLinks({
    selector: '.offer-title > a',
    label: 'PROPERTY',
  })
})

router.addHandler('PROPERTY', async ({ page, request, log }) => {
  const [details, moreInfo, other, price, title, locationArr] = await Promise.all([
    page
      .$('#detalji > div:nth-child(2)')
      .then((el) => el?.innerText())
      .then((val) => val?.toLowerCase().split('\n')),
    page
      .$('#detalji > div:nth-child(3)')
      .then((el) => el?.innerText())
      .then((val) => val?.toLowerCase().split('\n'))
      .then((val) => (val?.includes('dodatna opremljenost') ? val : undefined)),
    page
      .$('#detalji > div:last-child')
      .then((el) => el?.innerText())
      .then((val) => val?.toLowerCase().split('\n'))
      .then((val) => (val?.includes('ostalo') ? val : undefined)),
    page
      .locator('.stickyBox__price')
      .innerText()
      .then((val) => {
        return +val.split('\n')[0].replace(' EUR', '').replace(/\s+/g, '')
      }),
    page
      .locator('.detail-title')
      .innerText()
      .then((val) => val.trim()),
    page
      .locator('.stickyBox__Location')
      .innerText()
      .then((val) => val.split(',').map((el) => el.toLowerCase().trim())),
  ])

  log.info('TESTING: ', { details, moreInfo, other })

  const type = getAttribute('kategorija', details)

  const forSale = getAttribute('transakcija', details) === 'prodaja' ? true : false
  const houseOrApartment = type?.includes('kuća')
    ? 'house'
    : type?.includes('garsonjera') || type?.includes('stan')
    ? 'apartment'
    : null

  const originalId = request.url.split('/').slice(-2, -1)[0]
  const url = request.url
  const numOfRooms = getAttribute<number>('broj soba', details, 'number')
  const numOfBathrooms = getAttribute<number>('broj kupatila', details, 'number')
  const sqMeters = parseNumber(
    (getAttribute('kvadratura', details) || getAttribute('korisna površina do', details))?.split(' ')[0],
  )
  const landArea = getAttribute('površina zemljišta', details)?.split(' ')[0]
  const yearBuilt = getAttribute<number>('godina izgradnje', details, 'number')
  const balcony = moreInfo?.includes('terasa') || moreInfo?.includes('balkon') || moreInfo?.includes('lođa')
  const basement = moreInfo?.includes('podrum')
  const elevator = moreInfo?.includes('lift')
  const parking =
    moreInfo?.includes('spoljno parking mesto') || moreInfo?.includes('garaža') || moreInfo?.includes('garažno mesto')
  const garage = moreInfo?.includes('garaža') || moreInfo?.includes('garažno mesto')
  const pool = moreInfo?.includes('bazen')
  const garden = moreInfo?.includes('vrt')
  const reception = moreInfo?.includes('recepcija')
  const registration = getAttribute('uknjiženo', details)?.includes('da') ?? false

  const totalFloors: number | null = getAttribute('ukupan brој spratova', details, 'number')
  let floor: number | null = null
  const floorString = getAttribute('spratnost', details)
  switch (floorString) {
    case 'suteren':
      floor = -1
      break
    case 'prizemlje':
    case 'visoko prizemlje':
      floor = 0
      break
    case 'nije poslednji sprat':
      floor = null
      break
    case '30+':
      floor = 30
      break
    default:
      floor = parseNumber(floorString)
  }

  const heatings = getAttribute('grejanje', other)
    ?.split(',')
    .map((el) => el.trim())

  const centralHeating = heatings?.includes('centralno grejanje') ?? false
  const thermalStorage = heatings?.includes('ta pec') ?? false
  const airCon = heatings?.includes('klima uređaj') ?? false
  const electricHeating = heatings?.includes('etažno grejanje na struju') ?? false
  const gasHeating = heatings?.includes('etažno grejanje na gas') ?? false
  const solidFuelHeating = heatings?.includes('etažno grejanje na čvrsto gorivo') ?? false
  const floorHeating = heatings?.includes('podno grejanje') ?? false

  if (forSale === null || houseOrApartment === null || isNaN(price)) {
    log.error('Insufficient data for db, will be stored in dataset!', {
      url: request.url,
      forSale,
      houseOrApartment,
      price,
    })
    Dataset.pushData({ url, originalId, title, forSale, type: houseOrApartment, error: true })
    return
  }

  log.info('Adding new property...', { url })

  if (houseOrApartment === 'house') {
    const newRow: NewHouseForRent | NewHouseForSale = {
      originalId,
      url,
      title,
      city: locationArr[0],
      location: locationArr.join(','),
      numOfRooms: numOfRooms?.toString(),
      numOfBathrooms,
      sqMeters: sqMeters?.toString(),
      landArea,
      yearBuilt,
      balcony,
      basement,
      elevator,
      parking,
      garage,
      pool,
      garden,
      reception,
      airCon,
      centralHeating,
      thermalStorage,
      electricHeating,
      gasHeating,
      solidFuelHeating,
      floorHeating,
      totalFloors,
      registration,
      price: price.toString(),
    }

    await Promise.all([
      db
        .insert(forSale ? housesForSale : housesForRent)
        .values(newRow)
        .onConflictDoUpdate({
          target: [(forSale ? housesForSale : housesForRent).url, (forSale ? housesForSale : housesForRent).originalId],
          set: { ...newRow },
        }),
      Dataset.pushData({ ...newRow, forSale, type: houseOrApartment }),
    ])
  } else if (houseOrApartment === 'apartment') {
    const newRow: NewApartmentForRent | NewApartmentForSale = {
      originalId,
      url,
      title,
      city: locationArr[0],
      location: locationArr.join(','),
      numOfRooms: numOfRooms?.toString(),
      numOfBathrooms,
      sqMeters: sqMeters?.toString(),
      yearBuilt,
      balcony,
      basement,
      elevator,
      parking,
      garage,
      pool,
      garden,
      reception,
      airCon,
      centralHeating,
      thermalStorage,
      electricHeating,
      gasHeating,
      solidFuelHeating,
      floorHeating,
      totalFloors,
      floor,
      registration,
      price: price.toString(),
    }

    await Promise.all([
      db
        .insert(forSale ? apartmentsForSale : apartmentsForRent)
        .values(newRow)
        .onConflictDoUpdate({
          target: [
            (forSale ? apartmentsForSale : apartmentsForRent).url,
            (forSale ? apartmentsForSale : apartmentsForRent).originalId,
          ],
          set: { ...newRow },
        }),
      Dataset.pushData({ ...newRow, forSale, type: houseOrApartment }),
    ])
  }
})
