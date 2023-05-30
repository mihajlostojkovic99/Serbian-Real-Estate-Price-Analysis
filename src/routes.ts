import { Dataset, createPlaywrightRouter, enqueueLinks } from "crawlee"

export const router = createPlaywrightRouter()

router.addHandler("HOMEPAGE", async ({ request, log, enqueueLinks, page }) => {
	log.info(`Fetching urls on HOMEPAGE...`, { url: request.loadedUrl })

	const priceFromSelector = ".form-control.adv-search-form-input-price-gte"
	const priceToSelector = ".form-control.adv-search-form-input-price-lte"
	const buttonSelector = ".btn.adv-search-form-search-btn"

	let priceFrom = 0
	let priceTo = 80000

	// await page.waitForSelector(".form-control.adv-search-form-input-price-lte")

	while (true) {
		await page.fill(priceFromSelector, priceFrom.toString())
		await page.type(priceToSelector, priceTo.toString(), { delay: 300 })
		await page.waitForTimeout(2000)
		const numOfProperties = await page.$eval(buttonSelector, (el) =>
			parseInt(
				el.textContent
					?.split(" ")
					.filter((text) => !isNaN(parseInt(text)))
					.join("") ?? "-1"
			)
		)
		log.info(`Number of properties for the search criteria is: ${numOfProperties}`)
		if (numOfProperties === -1 || isNaN(numOfProperties)) {
			log.error("Number of properties not found on the submit button!", { numOfProperties })
			return
		}
		if (numOfProperties < 10000) {
			priceTo += 10000
			page.fill(priceToSelector, "")
		} else {
			priceTo -= 10000
			break
		}
	}

	log.info(`Final max price is set to: ${priceTo}`)

	// await enqueueLinks({
	// 	regexps: [
	// 		/https:\/\/www\.nekretnine\.rs\/stambeni-objekti\/lista\/po-stranici\/20\/stranica\/([2-9]|[1-9][0-9]|1[0-9]{2})(?!\/\?)/,
	// 	],
	// 	label: "LIST",
	// })
})

router.addHandler("LIST", async ({ page, request, log, enqueueLinks }) => {
	const pageNumber = await page.$eval(".next-number.active", (el) => el.textContent)
	log.info(`Fetching urls on LIST page ${pageNumber}...`, { url: request.loadedUrl })

	await enqueueLinks({
		regexps: [
			/https:\/\/www\.nekretnine\.rs\/stambeni-objekti\/lista\/po-stranici\/20\/stranica\/([2-9]|[1-9][0-9]|1[0-9]{2})(?!\/\?)/,
		],
		label: request.label,
	})
})
