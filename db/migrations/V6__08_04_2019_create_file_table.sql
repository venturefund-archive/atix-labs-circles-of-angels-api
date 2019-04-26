CREATE TABLE public.file (
	"id" SERIAL PRIMARY KEY,
	"path" varchar NOT NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL
);