CREATE TABLE public.user (
	"id" SERIAL PRIMARY KEY,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"pwd" varchar NOT NULL,
	"roleId" int4 NOT NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	FOREIGN KEY ("roleId") REFERENCES "role"(id)
);