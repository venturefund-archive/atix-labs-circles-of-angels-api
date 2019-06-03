ALTER TABLE public."project" ADD COLUMN "blockchainStatus" int4 NOT NULL DEFAULT 1;

ALTER TABLE public."milestone" ADD COLUMN "blockchainStatus" int4 NOT NULL DEFAULT 1;

ALTER TABLE public."activity" ADD COLUMN "blockchainStatus" int4 NOT NULL DEFAULT 1;
