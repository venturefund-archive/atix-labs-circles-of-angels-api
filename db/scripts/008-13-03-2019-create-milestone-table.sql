create table public.milestone (
	"id" SERIAL primary key,
	"projectId" int4,
	"quarter" text,
	"tasks" text,
	"impact" text,
	"impactCriterion" text,
	"signsOfSuccess" text,
	"signsOfSuccessCriterion" text,
	"category" text,
	"keyPersonnel" text,
	"budget" text,
	"status" int2 NOT NULL,
	"createdAt" date NULL,
	"updatedAt" date NULL,
	FOREIGN KEY ("projectId") REFERENCES project(id) ON DELETE CASCADE
);