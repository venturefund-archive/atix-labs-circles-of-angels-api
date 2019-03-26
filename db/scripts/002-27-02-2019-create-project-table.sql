CREATE TABLE public.project (
    "id" SERIAL primary key,
    "projectName" varchar(50) NOT NULL,
    "ownerId" int4 NOT NULL,
    "mission" text NOT NULL,
    "milestonesFile" text NOT NULL,
    "problemAddressed" text not null,
    "location" text NOT null,
    "timeframe" text not null,
    "coverPhoto" text not null,
    "cardPhoto" text not null,
    "status" int2 not null,
    "goalAmount" int8 not null,
    "faqLink" varchar not null,
    "pitchProposal" varchar(100) not null,
    "projectAgreement" varchar(100),
    "createdAt" date,
    "updatedAt" date
);