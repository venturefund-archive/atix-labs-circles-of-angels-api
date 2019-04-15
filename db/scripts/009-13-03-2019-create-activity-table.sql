create table public.activity (
	"id" SERIAL primary key,
	"milestoneId" int4,
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
	FOREIGN KEY ("milestoneId") REFERENCES milestone(id) ON DELETE CASCADE
);