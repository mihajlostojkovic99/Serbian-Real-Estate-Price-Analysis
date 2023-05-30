// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration, RequestOptions } from "crawlee"
import { router } from "./routes.js"

const startUrls: RequestOptions[] = [
	{
		url: "https://www.nekretnine.rs/",
		label: "HOMEPAGE",
	},
]

const crawler = new PlaywrightCrawler({
	// proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
	requestHandler: router,
	headless: false,
	maxRequestsPerCrawl: 10,
	maxRequestsPerMinute: 20,
})

await crawler.run(startUrls)
