create table public.activity (
	id SERIAL primary key not NULL,
	"milestoneId" int4,
	tasks text,
	impact text,
	"impactCriterion" text,
	"signsOfSuccess" text,
	"signsOfSuccessCriterion" text,
	category text,
	"keyPersonnel" text,
	budget text,
	FOREIGN KEY ("milestoneId") REFERENCES milestone(id)
);