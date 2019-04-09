CREATE TABLE public.photo (
	"id" serial NOT NULL,
	"path" varchar NOT NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	CONSTRAINT photo_pkey PRIMARY KEY (id)
);
