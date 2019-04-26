CREATE TABLE public.fund_transfer (
	id SERIAL primary key,
	"transferId" varchar NOT NULL,
	"senderId" int4 NOT NULL,
	"destinationAccount" varchar NOT NULL,
	currency varchar NOT NULL,
	"projectId" int4 NOT NULL,
	state int2 NOT NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	amount int4 NOT null,
	FOREIGN KEY ("senderId") REFERENCES "user"(id),
	FOREIGN KEY ("projectId") REFERENCES project(id) on delete cascade
);