CREATE TABLE public.user_social_entrepreneur (
	"id" SERIAL primary key,
	"userId" int4 not null,
	"company" varchar(80) not null,
	"phoneNumber" varchar(80),
	foreign key ("userId") references "user"(id)
);