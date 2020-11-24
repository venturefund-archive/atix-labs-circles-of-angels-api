CREATE TABLE public.user_wallet
(
    id integer NOT NULL,
    "userId" integer NOT NULL,
    address character varying(42),
    "encryptedWallet" json,
    mnemonic character varying(200),
    active boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX "onlyActive" ON public.user_wallet("userId") where (active);
ALTER TABLE public.user_wallet OWNER to atixlabs;