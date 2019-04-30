CREATE TABLE public.user_social_entrepreneur (
	"id" SERIAL primary key,
	"userId" int4 not null,
	"company" varchar(80) not null,
	"registrationNumber" varchar(80) not null,
	"address" varchar(80) not null,
	"industry" varchar(80) not null,
	"bank_account" varchar(40) not null,
	foreign key ("userId") references "user"(id)
);