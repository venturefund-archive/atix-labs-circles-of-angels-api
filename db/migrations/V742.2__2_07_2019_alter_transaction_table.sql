ALTER TABLE public."transaction" ALTER COLUMN "sender" DROP NOT NULL;
ALTER TABLE public."transaction" ALTER COLUMN "receiver" DROP NOT NULL;
ALTER TABLE public."transaction" ALTER COLUMN "transactionHash" DROP NOT NULL;