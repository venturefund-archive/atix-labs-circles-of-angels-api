CREATE TABLE public.answer (
	"id" SERIAL PRIMARY KEY,
	"questionId" int4 NOT NULL,
	"answer" text NULL,
  foreign key ("questionId") references question(id) on delete cascade
);