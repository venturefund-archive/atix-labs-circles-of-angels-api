
CREATE TABLE public.user_project (
	"id" SERIAL primary key,
	"status" int2 not null,
	"userId" int4 not null,
	"projectId" int4 not null,
	foreign key ("userId") references "user"(id),
  foreign key ("projectId") references project(id)    
);
