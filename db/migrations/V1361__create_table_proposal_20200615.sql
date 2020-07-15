CREATE TYPE tx_evidence_status AS ENUM(
  'notsent',
  'sent',
  'confirmed',
  'failed'
);

DROP TABLE public.proposal;
CREATE TABLE public.proposal (
	id SERIAL NOT NULL,
	"proposalId" int4 NOT NULL,
    "daoId" int4 NOT NULL,
    "txHash" varchar(80) NOT NULL,
    "createdAt" date DEFAULT now(),
    status tx_proposal_status DEFAULT 'notsent',
    PRIMARY KEY (id),
);
