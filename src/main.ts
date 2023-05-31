// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration, RequestOptions } from "crawlee"
import { router } from "./routes.js"

const startUrls: RequestOptions[] = [
	{
		// Apartments for sale
		url: "https://www.nekretnine.rs/stambeni-objekti/stanovi/lista/po-stranici/20/",
		label: "HOMEPAGE",
	},
	{
		// Apartments for renting
		url: "https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/izdavanje/lista/po-stranici/20/",
		label: "LIST",
	},
	{
		// Houses for sale
		url: "https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/prodaja/lista/po-stranici/20/",
		label: "LIST",
	},
	{
		// Houses for renting
		url: "https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/izdavanje/lista/po-stranici/20/",
		label: "LIST",
	},
]

const crawler = new PlaywrightCrawler({
	// proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
	requestHandler: router,
	headless: false,
	maxRequestsPerCrawl: 20,
	maxRequestsPerMinute: 10,
	requestHandlerTimeoutSecs: 60 * 5,
})

await crawler.run(startUrls)
