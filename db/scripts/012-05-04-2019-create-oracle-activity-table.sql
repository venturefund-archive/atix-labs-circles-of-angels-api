CREATE TABLE public.oracle_activity (
	"userId" int4 not null,
	"activityId" int4 not null,
	foreign key ("userId") references "user"(id),
  foreign key ("activityId") references activity(id),
  primary key ("userId", "activityId")
);