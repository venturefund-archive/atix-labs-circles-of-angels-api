CREATE TABLE public.activity_photo (
	"id" SERIAL PRIMARY KEY,
	"activityId" int4 NOT NULL,
	"photoId" int4 NOT NULL,
	"fileHash" varchar(80) NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	"fileHash" varchar(80) NULL,
	FOREIGN KEY ("activityId") REFERENCES activity(id) on delete cascade,
	FOREIGN KEY ("photoId") REFERENCES photo(id) on delete cascade
);