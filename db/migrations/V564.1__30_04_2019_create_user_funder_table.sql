CREATE TABLE public.user_funder (
	"id" SERIAL primary key,
	"userId" int4 not null,
	"phoneNumber" varchar(80),
	foreign key ("userId") references "user"(id)
);