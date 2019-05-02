CREATE TABLE public.question (
	"id" SERIAL PRIMARY KEY,
	"question" text NOT NULL,
	"role" int4 NOT NULL,
	"answerLimit" int2 NOT NULL
);