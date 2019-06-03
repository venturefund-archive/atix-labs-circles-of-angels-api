CREATE TABLE public.blockchain_block (
    "id" SERIAL NOT NULL,
	"blockNumber" int4 NOT NULL,
	"transactionHash" varchar(80) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);