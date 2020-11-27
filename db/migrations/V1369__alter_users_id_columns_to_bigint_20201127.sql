    ALTER TABLE public."user"
    ALTER COLUMN id TYPE bigint;

ALTER TABLE public.project
    ALTER COLUMN "ownerId" TYPE bigint;

ALTER TABLE public.answer_question
    ALTER COLUMN "userId" TYPE bigint;

ALTER TABLE public.fund_transfer
    ALTER COLUMN "senderId" TYPE bigint;

ALTER TABLE public.project_experience
    ALTER COLUMN "userId" TYPE bigint;

ALTER TABLE public.project_follower
    ALTER COLUMN "userId" TYPE bigint;

ALTER TABLE public.project_funder
    ALTER COLUMN "userId" TYPE bigint;

ALTER TABLE public.project_oracle
    ALTER COLUMN "userId" TYPE bigint;

ALTER TABLE public.task
    ALTER COLUMN "oracleId" TYPE bigint;