CREATE TABLE public.project (
	"id" SERIAL NOT null primary key,
	"projectName" varchar(50) NOT NULL,
	"ownerId" int4 NOT NULL,
	"mission" text NOT NULL,
	"problemAddressed" text not null,
	"location" text NOT null,
	"timeframe" text not null,
	"photo" text not null,
	"status" int2 not null,
	"createdAt" date,
	"updatedAt" date
);