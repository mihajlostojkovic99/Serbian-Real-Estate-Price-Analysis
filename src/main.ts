import { PlaywrightCrawler, RequestOptions, Configuration } from "crawlee"
import { router } from "./routes.ts"

const startUrls: RequestOptions[] = [
	{
		// Apartments for sale
		url: "https://www.nekretnine.rs/stambeni-objekti/stanovi/lista/po-stranici/20/",
		label: "HOMEPAGE",
	},
	// {
	// 	// Apartments for renting
	// 	url: "https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/izdavanje/lista/po-stranici/20/",
	// 	label: "LIST",
	// },
	// {
	// 	// Houses for sale
	// 	url: "https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/prodaja/lista/po-stranici/20/",
	// 	label: "LIST",
	// },
	// {
	// 	// Houses for renting
	// 	url: "https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/izdavanje/lista/po-stranici/20/",
	// 	label: "LIST",
	// },
]

const config = new Configuration({
	availableMemoryRatio: 0.5,
	maxUsedCpuRatio: 0.6,
	purgeOnStart: false,
	persistStorage: true,
})

const crawler = new PlaywrightCrawler(
	{
		// proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
		requestHandler: router,
		// headless: false,
		maxRequestsPerCrawl: 50,
		maxRequestsPerMinute: 20,
		requestHandlerTimeoutSecs: 60 * 5,
	},
	config
)

await crawler.run(startUrls)
