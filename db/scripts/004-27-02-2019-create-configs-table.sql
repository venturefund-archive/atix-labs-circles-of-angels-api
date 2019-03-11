CREATE TABLE public.configs (
	id SERIAL PRIMARY KEY,
	"key" varchar NOT NULL,
	"value" varchar NOT NULL,
	createdAt date NULL,
	updatedAt date NULL
);
