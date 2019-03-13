create table public.project_status (
	"status" int2 NOT NULL,
	"name" varchar NOT NULL
);

INSERT INTO public.project_status
(status, "name")
VALUES(0, 'Pending Approval');

INSERT INTO public.project_status
(status, "name")
VALUES(1, 'Published');
