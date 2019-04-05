CREATE TABLE public.project (
    "id" SERIAL primary key,
    "projectName" varchar(50) NOT NULL,
    "ownerId" int4 NOT NULL,
    "mission" text NOT NULL,
    "problemAddressed" text not null,
    "location" text NOT null,
    "timeframe" text not null,
    "coverPhoto" text null,
    "cardPhoto" text null,
    "status" int2 not null,
    "goalAmount" float4 not null,
    "faqLink" varchar not null,
    "pitchProposal" varchar(100) null,
    "projectAgreement" varchar(100),
    "milestonesFile" varchar(100) null,
    "createdAt" date,
    "updatedAt" date
);