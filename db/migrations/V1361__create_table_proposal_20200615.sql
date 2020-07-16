CREATE TYPE tx_proposal_status AS ENUM(
  'notsent',
  'sent',
  'confirmed',
  'failed'
);

DROP TABLE public.proposal;
CREATE TABLE public.proposal (
  "id" serial NOT NULL,
	"proposalId" int4 NOT NULL,
  "daoId" int4 NOT NULL,
  "applicant" varchar(42) NOT NULL,
  "proposer" varchar(42) NOT NULL,
  "description" text,
  "type" int4 NOT NULL,
  "txHash" varchar(80) DEFAULT NULL,
  "createdAt" date DEFAULT now(),
  status tx_proposal_status DEFAULT 'notsent',
	PRIMARY KEY (id),
  FOREIGN KEY ("applicant") REFERENCES public.user (address),
  FOREIGN KEY ("proposer") REFERENCES public.user (address),
  UNIQUE ("txHash")
);
