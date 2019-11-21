CREATE DATABASE coadb;

ALTER DATABASE coadb OWNER TO postgres;

\connect coadb
CREATE TYPE ROLE AS ENUM (
    'entrepreneur',
    'funder',
    'oracle',
    'admin'
);

CREATE TABLE public.user (
    id SERIAL NOT NULL,
    "firstName" varchar(80) NOT NULL,
    "lastName" varchar(80),
    email varchar(40) NOT NULL,
    password varchar(80) NOT NULL,
    -- TODO : is there any way to use `role` as field name.
    "role" ROLE NOT NULL,
    "createdAt" date DEFAULT now(),
    address varchar(42) NOT NULL,
    "privKey" varchar(80) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TYPE ProjectStatus AS ENUM (
    'editing',
    'pending',
    'consensus',
    'ongoing'
);

CREATE TABLE public.project (
    id SERIAL NOT NULL,
    "projectName" varchar(50) NOT NULL,
    "ownerId" integer NOT NULL,
    "createdAt" date DEFAULT NOW(),
    "transactionHash" varchar(80) NOT NULL,
    mission text,
    location text,
    "problemAddressed" text,
    timeframe text,
    status ProjectStatus DEFAULT 'editing',
    "goalAmount" real NOT NULL,
    "faqLink" text,
    "coverPhotoPath" varchar(100),
    "cardPhotoPath" varchar(100),
    proposal text,
    "agreementPath" varchar(100),
    PRIMARY KEY (id),
    FOREIGN KEY ("ownerId") REFERENCES public.user (id)
);

CREATE TABLE public.milestone (
    id SERIAL NOT NULL,
    "projectId" int,
    "createdAt" date DEFAULT NOW(),
    description text,
    category text,
    PRIMARY KEY (id),
    FOREIGN KEY ("projectId") REFERENCES public.project (id)
);

-- CREATE TABLE public.activity (
CREATE TABLE public.task (
    id SERIAL NOT NULL,
    "milestoneId" int,
    "createdAt" date DEFAULT NOW(),
    "taskHash" varchar(80) DEFAULT NULL,
    "oracleAddress" varchar(42) NOT NULL,
    description text, -- TODO : should be NOT NULL
    "reviewCriteria" text,
    category text,
    "keyPersonnel" text,
    budget text,
    PRIMARY KEY (id),
    FOREIGN KEY ("milestoneId") REFERENCES public.milestone (id),
    FOREIGN KEY ("oracleAddress") REFERENCES public.user (address)
);

CREATE TABLE public.transaction (
    id SERIAL NOT NULL,
    sender varchar(42) NOT NULL,
    data text NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE public.project_experience (
    id SERIAL NOT NULL,
    "projectId" int NOT NULL,
    "userId" int NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("projectId") REFERENCES public.project (id),
    FOREIGN KEY ("userId") REFERENCES public.user (id)
);

CREATE TABLE public.pass_recovery (
    id SERIAL NOT NULL,
    token varchar(80) NOT NULL,
    email varchar(80) NOT NULL,
    createdAt timestamp with time zone NOT NULL
);

CREATE TABLE public.question (
    id SERIAL NOT NULL,
    question text NOT NULL,
    --type enum('text', 'single option', 'multiple options') --
    PRIMARY KEY (id)
);

CREATE TABLE public.answer (
    id SERIAL NOT NULL,
    questionId integer NOT NULL,
    answer text
);

CREATE TABLE public.answer_question (
    id SERIAL NOT NULL,
    questionId integer NOT NULL,
    answerId integer NOT NULL,
    customAnswer text,
    userId integer NOT NULL PRIMARY KEY (id)
);

CREATE TABLE public.file (
    id SERIAL NOT NULL,
    path character varying NOT NULL,
    createdAt date,
    PRIMARY KEY (id)
);

-- COPY public.user (id, username, email, pwd, address, roleId, createdAt, updatedAt, registrationStatus, privKey, transferBlockchainStatus) FROM stdin;
-- 1	User Admin	admin@atixlabs.com	$2b$10$yjNwH3K0M72zmvYzOqTf.e/0K//I/McY8QrTnOFDeg7iTHZ6l0l2K	0x0f8800393cCa643a0f7717f9D3e47797Ab5Ec190	1	2019-10-23	2019-10-23	2	0xeced554a27c7c0c88668031d6d46b91ae7a8d64a883537cff62c964ec08d07a8	2
-- \.