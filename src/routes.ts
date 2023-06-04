import { Dataset, createPlaywrightRouter } from "crawlee"
import { getAttribute, parseNumber } from "./util/string.ts"

export const router = createPlaywrightRouter()

const MAX_PRICE = 30_000_000
const STEP = 20_000

type Property = {
	id: string | null
	url: string
	forSale: boolean | null
	type: "house" | "apartment" | null
	title: string | null
	location: string | null // nicely formated as "city, municipality" all lowercase etc.
	sqMeters: number | null
	landArea: number | null
	yearBuilt: number | null
	floor: number | null
	totalFloors: number | null
	registration: boolean | null
	floorHeating: boolean | null
	centralHeating: boolean | null
	electricHeating: boolean | null
	solidFuelHeating: boolean | null
	gasHeating: boolean | null
	thermalStorage: boolean | null
	airCon: boolean | null
	numOfRooms: number | null
	numOfToilets: number | null
	parking: boolean | null
	garage: boolean | null
	elevator: boolean | null
	balcony: boolean | null
	basement: boolean | null
	pool: boolean | null
	garden: boolean | null
	reception: boolean | null
	price: number | null
}

router.use(async ({ blockRequests, request }) => {
	if (request.label !== "HOMEPAGE")
		await blockRequests({ extraUrlPatterns: ["https://cms.nekretnine.rs/foto/*", "https://img.nekretnine.rs/foto/*"] })
})

router.addHandler("HOMEPAGE", async ({ request, log, enqueueLinks, page }) => {
	page.route("**/*", (route) => {
		if (route.request().resourceType() === "image") {
			route.abort()
		}
	})
	log.info(`Fetching price ranges on HOMEPAGE...`, { url: request.loadedUrl })

	const priceFromSelector = "#slider-range-price-from"
	const priceToSelector = "#slider-range-price-to"
	const numSelector = "#search-count-number"
	const spinnerSelector = "#search-count-loader"
	const submitSelector = "#apply-filters-btn"

	let priceFrom = 0
	let priceTo = 80000

	// choose only apartments that are being sold
	const sellingHandle = await page.$("#filter-options > div:nth-child(4) > ul > li:nth-child(2) > a")
	await sellingHandle?.click()

	while (priceTo <= MAX_PRICE) {
		// clean price input fields
		await page.fill(priceFromSelector, "")
		await page.fill(priceToSelector, "")

		await page.fill(priceFromSelector, priceFrom.toString())

		// find the new priceTo
		while (true) {
			if (priceFrom >= 160_000) {
				priceTo = MAX_PRICE
				break
			}
			await page.type(priceToSelector, priceTo.toString(), { delay: 300 })
			await page.focus(priceFromSelector)
			await page.locator(spinnerSelector).waitFor({ state: "visible" })
			await page.locator(numSelector).waitFor({ state: "visible" })
			const numOfProperties = await page.$eval(numSelector, (el) =>
				parseInt(el.textContent?.split(" ")[1].slice(1, -1) ?? "-1")
			)
			if (numOfProperties === -1 || isNaN(numOfProperties)) {
				log.error("Number of properties not found on the submit button!", { numOfProperties })
				return
			}
			if (numOfProperties < 10000) {
				priceTo += STEP
				await page.fill(priceToSelector, "")
			} else {
				priceTo -= STEP
				break
			}
		}

		//get the link for that range and push it
		await page.fill(priceToSelector, "")
		await page.fill(priceToSelector, priceTo.toString())
		await page.focus(priceFromSelector)
		await page.waitForSelector(spinnerSelector, { state: "visible" })
		await page.waitForSelector(numSelector, { state: "visible" })
		await enqueueLinks({ selector: submitSelector, label: "LIST" })

		log.info(`A new price range is established! The range is from ${priceFrom} to ${priceTo}.`, {
			numOfProperties: await page.$eval(numSelector, (el) =>
				parseInt(el.textContent?.split(" ")[1].slice(1, -1) ?? "-1")
			),
		})

		// priceFrom is now priceTo
		priceFrom = priceTo
		priceTo += STEP
	}
})

router.addHandler("LIST", async ({ page, request, log, enqueueLinks }) => {
	if (request.url.slice(-3, -1) === "10") {
		await enqueueLinks({ urls: [request.url.slice(0, -3).concat("20/")], label: "LIST" })
		return
	}

	const pageNumber = await page.locator(".next-number.active").innerText()
	const offerType = await page
		.locator("body > div:nth-child(18) > div.list-page > div:nth-child(1) > ol > li:nth-child(4) > span")
		.innerText()
	log.info(`Fetching urls on "${offerType ?? "not found"}" page number ${pageNumber ?? "not found"}...`, {
		url: request.loadedUrl,
	})

	await enqueueLinks({
		selector: ".next-number",
		globs: [
			"https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/izdavanje/lista/po-stranici/20/stranica/*",
			"https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/prodaja/lista/po-stranici/20/stranica/*",
			"https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/izdavanje/lista/po-stranici/20/stranica/*",
			"https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/*/lista/po-stranici/20/stranica/*",
		],
		label: request.label,
	})

	await enqueueLinks({
		selector: ".offer-title > a",
		label: "PROPERTY",
	})
})

router.addHandler("PROPERTY", async ({ page, request, log }) => {
	const details = await page
		.locator("#detalji > div:nth-child(2)")
		.innerText()
		.then((val) => val.toLowerCase().split("\n"))

	const type = getAttribute("kategorija", details)

	const moreInfo = await page
		.locator("#detalji > div:nth-child(3)")
		.innerText()
		.then((val) => val.toLowerCase().split("\n"))

	if (moreInfo[0] !== "dodatna opremljenost") {
		moreInfo.length = 0
	}

	const property: Property = {
		id: request.url.split("/").slice(-2, -1)[0],
		url: request.url,
		forSale: getAttribute("transakcija", details) === "prodaja" ? true : false,
		type: type?.includes("kuća")
			? "house"
			: type?.includes("garsonjera") || type?.includes("stan")
			? "apartment"
			: null,
		title: (await page.locator(".detail-title").innerText()).trim(),
		numOfRooms: getAttribute("broj soba", details, "number"),
		numOfToilets: getAttribute("broj kupatila", details, "number"),
		floor: null,
		totalFloors: getAttribute("ukupan brој spratova", details, "number"),
		sqMeters: parseNumber(
			(getAttribute("kvadratura", details) || getAttribute("korisna površina do", details))?.split(" ")[0]
		),
		landArea: parseNumber(getAttribute("površina zemljišta", details)?.split(" ")[0]),
		location: (await page.locator(".stickyBox__Location").innerText())
			.split(",")
			.map((el) => el.toLowerCase().trim())
			.join(","),
		yearBuilt: getAttribute("godina izgradnje", details, "number"),
		airCon: false,
		centralHeating: false,
		electricHeating: false,
		floorHeating: false,
		gasHeating: false,
		solidFuelHeating: false,
		thermalStorage: false,
		balcony: moreInfo.includes("terasa") || moreInfo.includes("balkon") || moreInfo.includes("lođa"),
		basement: moreInfo.includes("podrum"),
		elevator: moreInfo.includes("lift"),
		garden: moreInfo.includes("vrt"),
		parking:
			moreInfo.includes("spoljno parking mesto") || moreInfo.includes("garaža") || moreInfo.includes("garažno mesto"),
		garage: moreInfo.includes("garaža") || moreInfo.includes("garažno mesto"),
		pool: moreInfo.includes("bazen"),
		reception: moreInfo.includes("recepcija"),
		registration: getAttribute("uknjiženo", details)?.includes("da") ?? false,
		price: await page
			.locator(".stickyBox__price")
			.innerText()
			.then((val) => {
				return +val.split("\n")[0].replace(" EUR", "").replace(/\s+/g, "")
			}),
	}

	const floorString = getAttribute("spratnost", details)
	switch (floorString) {
		case "suteren":
			property.floor = -1
			break
		case "prizemlje":
		case "visoko prizemlje":
			property.floor = 0
			break
		case "nije poslednji sprat":
			property.floor = null
			break
		case "30+":
			property.floor = 30
			break
		default:
			property.floor = parseNumber(floorString)
	}

	const other = await page
		.locator("#detalji > div:last-child")
		.innerText()
		.then((val) => val.toLowerCase().split("\n"))

	const heatings = getAttribute("grejanje", other)
		?.split(",")
		.map((el) => el.trim())

	property.centralHeating = heatings?.includes("centralno grejanje") ?? false
	property.thermalStorage = heatings?.includes("ta pec") ?? false
	property.airCon = heatings?.includes("klima uređaj") ?? false
	property.electricHeating = heatings?.includes("etažno grejanje na struju") ?? false
	property.gasHeating = heatings?.includes("etažno grejanje na gas") ?? false
	property.solidFuelHeating = heatings?.includes("etažno grejanje na čvrsto gorivo") ?? false
	property.floorHeating = heatings?.includes("podno grejanje") ?? false

	log.info("Adding new property...", { url: property.url })
	await Dataset.pushData(property)
})
