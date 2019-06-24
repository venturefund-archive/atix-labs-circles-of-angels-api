CREATE TABLE public."transaction" (
    "id" SERIAL PRIMARY KEY,
    "sender" varchar(80) NOT NULL,
    "receiver" varchar(80) NOT NULL,
    "data" text NOT NULL,
    "status" int4 NOT NULL DEFAULT 1,
    "transactionHash" varchar(80) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT null,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT null 
);