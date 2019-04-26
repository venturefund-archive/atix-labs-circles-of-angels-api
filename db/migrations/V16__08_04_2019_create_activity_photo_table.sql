CREATE TABLE public.activity_photo (
	"id" SERIAL PRIMARY KEY,
	"activityId" int4 NOT NULL,
	"photoId" int4 NOT NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	"fileHash" varchar(80),
	FOREIGN KEY ("activityId") REFERENCES activity(id) on delete cascade,
	FOREIGN KEY ("photoId") REFERENCES photo(id) on delete cascade
);