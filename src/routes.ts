import { Dataset, createPlaywrightRouter, enqueueLinks } from "crawlee"

export const router = createPlaywrightRouter()

const MAX_PRICE = 30_000_000
const STEP = 20_000

router.addHandler("HOMEPAGE", async ({ request, log, enqueueLinks, page }) => {
	log.info(`Fetching urls on HOMEPAGE...`, { url: request.loadedUrl })

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
			await page.waitForSelector(spinnerSelector, { state: "visible" })
			await page.waitForSelector(numSelector, { state: "visible" })
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
	const pageNumber = await page.$eval(".next-number.active", (el) => el.textContent)
	log.info(`Fetching urls on LIST page ${pageNumber}...`, { url: request.loadedUrl })

	await enqueueLinks({
		// regexps: [
		// 	/https:\/\/www\.nekretnine\.rs\/stambeni-objekti\/lista\/po-stranici\/20\/stranica\/([2-9]|[1-9][0-9]|1[0-9]{2})(?!\/\?)/,
		// ],
		selector:
			"body > div:nth-child(26) > div.list-page > div.container.mt-4 > div.row > div.col-12.col-md-12.col-lg-8.col-xl-9.offer-container > div.row > div.col-12.col-lg-8.col-xl-9.offer-container > div.col-auto.col-md-12.m-auto.page-numbers.w-100 > div > div.col-7.col-lg-6 > div > a",
		label: request.label,
	})
})
