ALTER TABLE "apartments_for_rent" ADD COLUMN "date_updated" date DEFAULT now() NOT NULL;
ALTER TABLE "apartments_for_sale" ADD COLUMN "date_updated" date;
ALTER TABLE "apartments_for_sale" ADD COLUMN "date_created" date;
ALTER TABLE "apartments_for_sale" ADD COLUMN "date_scraped" date DEFAULT now() NOT NULL;
ALTER TABLE "houses_for_rent" ADD COLUMN "date_updated" date DEFAULT now() NOT NULL;
ALTER TABLE "houses_for_sale" ADD COLUMN "date_updated" date DEFAULT now() NOT NULL;