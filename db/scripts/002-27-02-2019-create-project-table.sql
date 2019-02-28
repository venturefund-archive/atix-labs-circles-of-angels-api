CREATE TABLE public.project (
	id int4 NOT NULL,
	name varchar(50) NOT NULL,
	"owner" int4 NOT NULL,
	description text NOT NULL,
	projectId int8 NOT NULL
);
