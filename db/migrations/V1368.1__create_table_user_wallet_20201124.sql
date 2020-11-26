CREATE TABLE public.user_wallet
(
    id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
    "userId" integer NOT NULL,
    address character varying(42),
    "encryptedWallet" json,
    mnemonic character varying(200),
    active boolean NOT NULL,
    "createdAt" date,
    PRIMARY KEY (id),
    CONSTRAINT fk_user
      FOREIGN KEY("userId") 
	  REFERENCES public.user(id)
);

CREATE UNIQUE INDEX "onlyActive" ON public.user_wallet("userId") where (active);
ALTER TABLE public.user_wallet OWNER to atixlabs;

ALTER TABLE public."user"
    ALTER COLUMN address DROP NOT NULL,
    ALTER COLUMN "encryptedWallet" DROP NOT NULL;