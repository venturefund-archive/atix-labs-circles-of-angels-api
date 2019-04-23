CREATE TABLE public.oracle_activity (
	"id" SERIAL primary key,
	"userId" int4 not null,
	"activityId" int4 not null,
	foreign key ("userId") references "user"(id) on delete cascade,
  foreign key ("activityId") references activity(id) on delete cascade,
  unique ("userId", "activityId")
);