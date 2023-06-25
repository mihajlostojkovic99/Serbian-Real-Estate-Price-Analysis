import { Dataset, createCheerioRouter } from 'crawlee'
import { parse } from 'date-fns'
import { getAttribute, parseNumber } from './util/string.ts'
import { db } from './db/drizzle.ts'
import {
  NewApartmentForRent,
  NewApartmentForSale,
  NewHouseForRent,
  NewHouseForSale,
  NewProperty,
  apartmentsForRent,
  apartmentsForSale,
  housesForRent,
  housesForSale,
  property,
} from './db/schema.ts'
import { parseDate } from './util/dates.ts'

export const router = createCheerioRouter()

// router.addHandler('HOMEPAGE', async ({ request, log, enqueueLinks, page }) => {
//   page.route('**/*', (route) => {
//     if (route.request().resourceType() === 'image') {
//       route.abort()
//     }
//   })
//   log.info(`Fetching price ranges on HOMEPAGE...`, { url: request.loadedUrl })

//   const priceFromSelector = '#slider-range-price-from'
//   const priceToSelector = '#slider-range-price-to'
//   const numSelector = '#search-count-number'
//   const spinnerSelector = '#search-count-loader'
//   const submitSelector = '#apply-filters-btn'

//   let priceFrom = 0
//   let priceTo = 80000

//   // choose only apartments that are being sold
//   const sellingHandle = await page.$('#filter-options > div:nth-child(4) > ul > li:nth-child(2) > a')
//   await sellingHandle?.click()

//   while (priceTo <= MAX_PRICE) {
//     // clean price input fields
//     await page.fill(priceFromSelector, '')
//     await page.fill(priceToSelector, '')

//     await page.fill(priceFromSelector, priceFrom.toString())

//     // find the new priceTo
//     while (true) {
//       if (priceFrom >= 160_000) {
//         priceTo = MAX_PRICE
//         break
//       }
//       await page.type(priceToSelector, priceTo.toString(), { delay: 300 })
//       await page.focus(priceFromSelector)
//       await page.locator(spinnerSelector).waitFor({ state: 'visible' })
//       await page.locator(numSelector).waitFor({ state: 'visible' })
//       const numOfProperties = await page.$eval(numSelector, (el) =>
//         parseInt(el.textContent?.split(' ')[1].slice(1, -1) ?? '-1'),
//       )
//       if (numOfProperties === -1 || isNaN(numOfProperties)) {
//         log.error('Number of properties not found on the submit button!', {
//           numOfProperties,
//         })
//         return
//       }
//       if (numOfProperties < 10000) {
//         priceTo += STEP
//         await page.fill(priceToSelector, '')
//       } else {
//         priceTo -= STEP
//         break
//       }
//     }

//     //get the link for that range and push it
//     await page.fill(priceToSelector, '')
//     await page.fill(priceToSelector, priceTo.toString())
//     await page.focus(priceFromSelector)
//     await page.waitForSelector(spinnerSelector, { state: 'visible' })
//     await page.waitForSelector(numSelector, { state: 'visible' })
//     await page.waitForSelector(submitSelector)
//     await enqueueLinks({ selector: submitSelector, label: 'LIST' })

//     log.info(`A new price range is established! The range is from ${priceFrom} to ${priceTo}.`, {
//       numOfProperties: await page.$eval(numSelector, (el) =>
//         parseInt(el.textContent?.split(' ')[1].slice(1, -1) ?? '-1'),
//       ),
//     })

//     // priceFrom is now priceTo
//     priceFrom = priceTo
//     priceTo += STEP
//   }
// })

router.addHandler('LIST', async ({ $, request, log, enqueueLinks }) => {
  if (request.url.includes('po-stranici/10/')) {
    await enqueueLinks({
      urls: [request.url.replace('po-stranici/10/', 'po-stranici/20/')],
      label: 'LIST',
    })
    return
  }

  const parsedUrl = request.url.split('/')
  const pageNumber = request.url.includes('po-stranici/20/stranica/') ? parsedUrl[parsedUrl.length - 2] : 1

  let filters = ''
  $('#izabrali-ste .remove-filter-link').each((_index, el) => {
    const content = $(el).text().trim()
    filters += content.substring(0, content.length - 2) + ' '
  })
  log.info(`Fetching urls on "${filters}" page number ${pageNumber}...`, { url: request.loadedUrl })

  await enqueueLinks({
    selector: '.offer-title > a',
    label: 'PROPERTY',
  })

  await enqueueLinks({
    selector: 'a.next-number',
    globs: [
      'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/izdavanje/lista/po-stranici/20/stranica/**',
      'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/prodaja/lista/po-stranici/20/stranica/**',
      'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/izdavanje/lista/po-stranici/20/stranica/**',
      'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/*/lista/po-stranici/20/stranica/**',
    ],
    label: request.label,
  })

  const dataset = await Dataset.open('crawled_links')
  await dataset.pushData({
    page: `PAGE "${filters}", page number ${pageNumber}, crawled`,
    url: request.loadedUrl,
  })
})

router.addHandler('PROPERTY', async ({ $, request, log }) => {
  const url = request.url
  const originalId = request.url.split('/').slice(-2, -1)[0]
  const title = $('h1.detail-title').text().trim()

  const dates = $('.property__body .updated')
    .text()
    .match(/\b\d{2}\.\d{2}\.\d{4}\b/g)

  const dateUpdated = dates && dates[0] ? parse(dates?.[0], 'dd.MM.yyyy', new Date()).toISOString() : undefined
  const datePosted = dates && dates[1] ? parse(dates?.[1], 'dd.MM.yyyy', new Date()).toISOString() : undefined

  const hasMunicipality = $('.stickyBox__Location').text().split(',').length > 1
  const preciseLocationRaw = $('.property__location')
    .text()
    .trim()
    .split('\n')
    .map((el) => el.trim())

  const [country, region, city] = preciseLocationRaw

  const municipality = hasMunicipality && preciseLocationRaw.length > 3 ? preciseLocationRaw[3] : undefined
  const street =
    hasMunicipality && preciseLocationRaw.length > 4
      ? preciseLocationRaw[4]
      : preciseLocationRaw.length > 3
      ? preciseLocationRaw[3]
      : undefined

  const price = parseNumber($('.stickyBox__price').text().split(' EUR')[0])

  let forSale: boolean | undefined
  let houseOrApartment: 'apartment' | 'house' | undefined
  let sqMeters: number | undefined
  let registered: boolean | undefined
  let landArea: number | undefined
  let numOfRooms: number | undefined
  let numOfBathrooms: number | undefined
  let yearBuilt: number | undefined
  let totalFloors: number | undefined
  let floor: number | undefined

  let balcony = false
  let basement = false
  let elevator = false
  let parking = false
  let garage = false
  let pool = false
  let garden = false
  let reception = false

  let centralHeating = false
  let thermalStorage = false
  let airCon = false
  let electricHeating = false
  let gasHeating = false
  let solidFuelHeating = false
  let floorHeating = false
  let heatPumpHeating = false

  $('.property__amenities').each((_index, element) => {
    const $element = $(element)
    const heading = $element.find('h3').text()

    switch (heading) {
      case 'Podaci o nekretnini':
        const $list = $element.find('li')
        $list.each((_index, element) => {
          const item = $(element).text().trim()
          const [category, value] = item.split(':').map((el) => el.trim())

          switch (category) {
            case 'Transakcija':
              forSale = value === 'Izdavanje' ? false : true
              break
            case 'Kategorija':
              const lowercase = value.toLowerCase()
              houseOrApartment =
                lowercase.includes('kuća') || lowercase.includes('kuće')
                  ? 'house'
                  : lowercase.includes('garsonjera') || lowercase.includes('stan')
                  ? 'apartment'
                  : undefined
              break
            case 'Kvadratura':
              sqMeters = parseNumber(value.split(' ')[0])
              break
            case 'Uknjiženo':
              registered = value === 'Da' ? true : false
              break
            case 'Površina zemljišta':
              landArea = parseNumber(value.split(' ')[0])
              break
            case 'Ukupan broj soba':
              numOfRooms = parseNumber(value)
              break
            case 'Broj kupatila':
              numOfBathrooms = parseNumber(value)
              break
            case 'Spratnost':
              switch (value) {
                case 'suteren':
                  floor = -1
                  break
                case 'prizemlje':
                case 'visoko prizemlje':
                  floor = 0
                  break
                case '30+':
                  floor = 30
                  break
                default:
                  floor = parseNumber(value)
              }
              break
            case 'Ukupan brој spratova':
            case 'Ukupan broj spratova':
              totalFloors = parseNumber(value)
              break
            case 'Godina izgradnje':
              yearBuilt = parseNumber(value)
              break
          }
        })
        break
      case 'Dodatna opremljenost':
        $element.find('li').each((_index, element) => {
          const value = $(element).text().trim()
          switch (value) {
            case 'Terasa':
            case 'Balkon':
            case 'Lođa':
              balcony = true
              break
            case 'Podrum':
              basement = true
              break
            case 'Lift':
              elevator = true
              break
            case 'Garaža':
            case 'Garažno mesto':
              garage = true
              parking = true
              break
            case 'Spoljno parking mesto':
              parking = true
              break
            case 'Bazen':
              pool = true
              break
            case 'Vrt':
              garden = true
              break
            case 'Recepcija':
              reception = true
              break
          }
        })
        break
      case 'Ostalo':
        $element.find('li').each((_index, element) => {
          const [category, commaList] = $(element)
            .text()
            .trim()
            .split(':')
            .map((el) => el.trim())

          if (category === 'Grejanje') {
            const list = commaList.split(',').map((el) => el.trim())
            list.forEach((value) => {
              switch (value) {
                case 'TA peć':
                  thermalStorage = true
                  break
                case 'Klima uređaj':
                  airCon = true
                  break
                case 'Peć na drva/ugalj':
                case 'Kamin':
                case 'Etažno grejanje na čvrsto gorivo':
                  solidFuelHeating = true
                  break
                case 'Etažno grejanje na struju':
                  electricHeating = true
                  break
                case 'Etažno grejanje na gas':
                case 'Plinska peć':
                  gasHeating = true
                  break
                case 'Toplotna pumpa':
                  heatPumpHeating = true
                  break
                case 'Centralno grejanje':
                  centralHeating = true
                  break
                case 'Podno grejanje':
                  floorHeating = true
                  break
              }
            })
          }
        })
        break
    }
  })

  if (forSale === undefined || houseOrApartment === undefined || price === undefined) {
    log.error('Insufficient data for db, will be stored in the insufficient_data dataset!', {
      url: request.url,
      forSale,
      houseOrApartment,
      price,
    })
    const dataset = await Dataset.open('insufficient_data')
    await dataset.pushData({ url, originalId, title, forSale, type: houseOrApartment, error: true })
    return
  }

  const newProperty: NewProperty = {
    url,
    originalId,
    title,
    datePosted,
    dateUpdated,
    country,
    region,
    city,
    municipality,
    street,

    forSale,
    type: houseOrApartment,
    sqMeters: sqMeters?.toString(),
    registered,
    landArea: landArea?.toString(),
    numOfRooms: numOfRooms?.toString(),
    numOfBathrooms,
    yearBuilt,
    totalFloors,
    floor,

    balcony,
    basement,
    elevator,
    parking,
    garage,
    pool,
    garden,
    reception,

    centralHeating,
    thermalStorage,
    airCon,
    electricHeating,
    gasHeating,
    solidFuelHeating,
    floorHeating,
    heatPumpHeating,
    price: price?.toString(),
  }

  log.info('Adding new property...', { url })

  const dataset = await Dataset.open('properties')

  await Promise.all([
    db
      .insert(property)
      .values(newProperty)
      .onConflictDoUpdate({
        target: [property.url],
        set: newProperty,
      }),
    dataset.pushData(newProperty),
  ])
})
