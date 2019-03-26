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
	FOREIGN KEY ("projectId") REFERENCES project(id) ON DELETE CASCADE
);