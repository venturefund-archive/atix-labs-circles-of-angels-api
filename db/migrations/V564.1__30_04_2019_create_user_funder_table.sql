CREATE TABLE public.user_funder (
	"id" SERIAL primary key,
	"userId" int4 not null,
	"identifier" int4 not null,
	"address" varchar(80) not null,
	"tel" varchar(40) not null,
	foreign key ("userId") references "user"(id),
	foreign key ("identifier") references "file"(id)
);