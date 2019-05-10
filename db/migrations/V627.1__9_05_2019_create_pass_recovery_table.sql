CREATE TABLE public.pass_recovery (
	"id" SERIAL PRIMARY KEY,
	"token" varchar(80) NOT NULL,
	"email" varchar(80) UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME zone NOT NULL
);