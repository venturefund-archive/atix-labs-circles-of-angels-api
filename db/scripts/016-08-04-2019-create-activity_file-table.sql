CREATE TABLE public.activity_file (
	"id" SERIAL PRIMARY KEY,
	"activityId" int4 NOT NULL,
	"fileId" int4 NOT NULL,
	"transactionHash" varchar(80) NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	FOREIGN KEY ("activityId") REFERENCES activity(id) on delete cascade,
	FOREIGN KEY ("fileId") REFERENCES file(id) on delete cascade
);