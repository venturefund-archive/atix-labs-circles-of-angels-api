ALTER TABLE public."transaction" ADD COLUMN "type" varchar(40);
ALTER TABLE public."transaction" ADD COLUMN "projectId" int4;
ALTER TABLE public."transaction" ADD COLUMN "milestoneId" int4;
ALTER TABLE public."transaction" ADD COLUMN "activityId" int4;