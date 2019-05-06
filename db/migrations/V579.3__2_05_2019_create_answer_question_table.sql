CREATE TABLE public.answer_question (
	"id" SERIAL PRIMARY KEY,
	"questionId" int4 NOT NULL,
  "answerId" int4 NOT NULL,
	"customAnswer" text NULL,
  "userId" int4 NOT NULL,
  foreign key ("questionId") references question(id) on delete cascade,
  foreign key ("answerId") references answer(id) on delete cascade,
  foreign key ("userId") references "user"(id) on delete cascade
);