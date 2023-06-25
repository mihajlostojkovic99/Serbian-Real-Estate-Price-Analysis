import 'dotenv/config.js'
import { PlaywrightCrawler, RequestOptions, Configuration, CheerioCrawler } from 'crawlee'
import { chromium } from 'playwright-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrationClient } from './db/drizzle.ts'
import { router } from './routes.ts'
import { cleanup } from './cleanup.ts'
import { exit } from 'process'

// belgrade with all locations: https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/deo-grada/29-novembra_ada-ciganlija_altina_andricev-venac_autokomanda_autoput_avala_bajlonijeva-pijaca_banjica_banovo-brdo_barajevo_batajnica_bele-vode-beograd_beli-potok-vozdovac-sve-podlokacije_beograd-na-vodi_beogradjanka-centar_bezanija_bogoslovija_borca-i_borca-ii_borca-iii_borca-iv_borca-v_botanicka-basta_brace-jerkovic_bubanj-potok_bulbuder_bulevar-kr-aleksandra_centar-uzi_cerak_cerak-vinogradi_cerski-venac_crveni-krst-vracar-sve-podlokacije_cubura_cukarica_cukaricka-padina_cvetanova-cuprija_cvetkova-pijaca_cvetni-trg_cvijiceva_dedinje-25-maj_dedinje-beli-dvor_dedinje-rtv-pink_denkova-basta_djeram-pijaca_dobanovci_donji-dorcol_dunavski-kej_dusanovac-vozdovac-sve-podlokacije_farmaceutski-fakultet_filmski-grad_galenika_glumcevo-brdo_golf-naselje_gornji-dorcol_gradic-pejton_gradska-bolnica_greda_grocka_gundulicev-venac_hadzipopovac_hala-pionir_ibarska-magistrala_institut-za-majku-i-dete_jajinci_jelovac_julino-brdo_juzni-bulevar_kalemegdan_kalenic-pijaca_kaludjerica_kanarevo-brdo_karaburma_kijevo-beograd_klinicki-centar_kluz_knez-mihajlova-centar_kneza-milosa-centar_knezevac_konjarnik-vozdovac-sve-podlokacije_kopitareva-gradina_kosancicev-venac_kosutnjak-beograd_kotez_krnjaca-palilula-sve-podlokacije_kumodraz-i_kumodraz-ii_labudovo-brdo_ledine_lekino-brdo_lestane-beograd_lion_lipov-lad_lipovacka-suma_lisicji-potok_mackov-kamen_makis_mali-mokri-lug_manjez_marinkova-bara_medak-padina_medakovic-i_medakovic-ii_medakovic-iii_miljakovac-i_miljakovac-ii_miljakovac-iii_mirijevo-i_mirijevo-ii_mirijevo-iii_mirijevo-iv_neimar_novi-beograd_novi-beograd-blok-1-fontana_novi-beograd-blok-10_novi-beograd-blok-11-hotel-jugoslavija_novi-beograd-blok-11a-opstina-nbg_novi-beograd-blok-11b_novi-beograd-blok-11c-stari-merkator_novi-beograd-blok-12-yubc_novi-beograd-blok-13-palata-federacije_novi-beograd-blok-14-park-usce_novi-beograd-blok-15-park-usce_novi-beograd-blok-16-usce-soping-centar_novi-beograd-blok-17-staro-sajmiste_novi-beograd-blok-19-sava-centar_novi-beograd-blok-19a_novi-beograd-blok-2_novi-beograd-blok-20-hotel-hayat_novi-beograd-blok-21-10-gimnazija_novi-beograd-blok-22_novi-beograd-blok-23_novi-beograd-blok-24-super-vero_novi-beograd-blok-25-arena_novi-beograd-blok-26_novi-beograd-blok-28-potkovica_novi-beograd-blok-29_novi-beograd-blok-3_novi-beograd-blok-30-b92_novi-beograd-blok-31-merkator_novi-beograd-blok-32-crkva-sv-dimitrija_novi-beograd-blok-33-genex-kula_novi-beograd-blok-34-studentski-grad_novi-beograd-blok-35-sc-11-april_novi-beograd-blok-37_novi-beograd-blok-38-os-ratko-mitrovic_novi-beograd-blok-39_novi-beograd-blok-4-politehnicka-akademija_novi-beograd-blok-40_novi-beograd-blok-41-expo-centar_novi-beograd-blok-41a-gtc_novi-beograd-blok-42_novi-beograd-blok-43-buvlja-pijaca_novi-beograd-blok-44-piramida_novi-beograd-blok-45-tc-enjub_novi-beograd-blok-49_novi-beograd-blok-5_novi-beograd-blok-53-kvantas_novi-beograd-blok-58_novi-beograd-blok-60_novi-beograd-blok-60-airport-city_novi-beograd-blok-61_novi-beograd-blok-62_novi-beograd-blok-63_novi-beograd-blok-64_novi-beograd-blok-65_novi-beograd-blok-66-tramvajska-stala_novi-beograd-blok-66a_novi-beograd-blok-67-belvil_novi-beograd-blok-67a_novi-beograd-blok-68_novi-beograd-blok-7-paviljoni_novi-beograd-blok-70-kineski-tc_novi-beograd-blok-70a_novi-beograd-blok-71_novi-beograd-blok-72_novi-beograd-blok-7a-paviljoni_novi-beograd-blok-8-paviljoni_novi-beograd-blok-8a_novi-beograd-blok-8a-paviljoni_novi-beograd-blok-9_novi-beograd-blok-9a-dom-zdravlja_novo-groblje_obilicev-venac_olimp-zvezdara-sve-podlokacije_orlovaca_ostruznica_ovca_padinska-skela-palilula-sve-podlokacije_palata-pravde_palilula-palilula-sve-podlokacije_palilulska-pijaca_partizanov-stadion_pasino-brdo_petlovo-brdo_pionirski-park_plavi-horizonti_politika-centar_postanska-stedionica_pregrevica_profesorska-kolonija_radiofar_rakovica-beograd_resnik-beograd_retenzija_rospi-cuprija_rudo_rusanj_sarajevska-beograd_sava-mala_savski-trg_savski-venac_senjak_severni-bulevar_skadarlija_skojevsko-naselje_slavija_slavujev-venac_smederevski-put_sopot-beograd_sremcica_stari-grad_stepa-stepanovic_strahinjica-bana_studentski-trg-centar_sumice-vozdovac-sve-podlokacije_suncana-padina_suncani-breg_surcin_tasmajdan_tehnicki-fakulteti_terazije-centar_topcider_toplicin-venac_torlak_tosin-bunar_tresnja_trg-republike-centar_trosarina-vozdovac-sve-podlokacije_uciteljsko-naselje_veliki-mokri-lug_veljko-vlahovic_vidikovac_vidikovacka-padina_vidikovacki-venac_viline-vode_vinca-beograd_visnjica_visnjicka-banja_vojvode-vlahovica_vozdovac_vracar-centar_vracar-hram_vukov-spomenik_zarkovo_zeleni-venac_zeleno-brdo_zeleznik-beograd_zemun-13-maj_zemun-backa_zemun-cara-dusana_zemun-centar_zemun-cukovac_zemun-donji-grad_zemun-gardos_zemun-gornji-grad_zemun-kalvarija_zemun-kej_zemun-marije-bursac_zemun-meandri_zemun-nova-galenika_zemun-novi-grad_zemun-polje_zemun-save-kovacevica_zemun-sutjeska_zemun-teleoptik_zira_zvezdara_zvezdarska-suma_zvezdin-stadion/grad/beograd/lista/po-stranici/20/
const startUrls: RequestOptions[] = [
  {
    // Apartments for sale 1-100_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/1_100000/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Apartments for sale 100_000-150_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/100000_150000/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Apartments for sale 150_000-300_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/150000_300000/lista/po-stranici/20/',
    label: 'LIST',
  },
  {
    // Apartments for sale 300_000-30_000_000 EUR
    url: 'https://www.nekretnine.rs/stambeni-objekti/stanovi/izdavanje-prodaja/prodaja/cena/300000_30000000/lista/po-stranici/20/',
    label: 'LIST',
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
  // {
  //   // Houses for renting
  //   url: 'https://www.nekretnine.rs/stambeni-objekti/kuce/izdavanje-prodaja/izdavanje/lista/po-stranici/20/',
  //   label: 'LIST',
  // },
]

const config = new Configuration({
  availableMemoryRatio: 0.7,
  // maxUsedCpuRatio: 0.95,
  purgeOnStart: false,
  persistStorage: true,
})

chromium.use(stealthPlugin())

const crawler = new CheerioCrawler(
  {
    requestHandler: router,
    // maxRequestsPerCrawl: 5,
    maxRequestsPerMinute: 60,
    requestHandlerTimeoutSecs: 60 * 3,
  },
  config,
)

// run db migrations
await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' })

// start crawling
await crawler.run(startUrls)

// discard properties with not enough info
// await cleanup()

exit()
