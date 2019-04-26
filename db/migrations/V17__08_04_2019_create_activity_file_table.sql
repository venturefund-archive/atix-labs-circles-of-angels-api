CREATE TABLE public.activity_file (
	"id" SERIAL PRIMARY KEY,
	"activityId" int4 NOT NULL,
	"fileId" int4 NOT NULL,
	"fileHash" varchar(80) NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	"fileHash" varchar(80) NULL,
	FOREIGN KEY ("activityId") REFERENCES activity(id) on delete cascade,
	FOREIGN KEY ("fileId") REFERENCES file(id) on delete cascade
);