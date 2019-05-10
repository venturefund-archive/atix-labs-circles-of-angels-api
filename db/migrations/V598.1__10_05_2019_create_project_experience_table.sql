CREATE TABLE public.project_experience (
	"id" SERIAL NOT NULL,
	"projectId" int4 NOT NULL,
	"userId" int4 NOT NULL,
	"fileId" int4 NULL,
	"comment" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NULL,
	CONSTRAINT "project_experience_pkey" PRIMARY KEY (id),
	CONSTRAINT "project_experience_projectId_fk" FOREIGN KEY ("projectId") REFERENCES project(id) ON DELETE CASCADE,
	CONSTRAINT "project_experience_userId_fk" FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,
	CONSTRAINT "project_experience_fileId_fk" FOREIGN KEY ("fileId") REFERENCES file(id)
);