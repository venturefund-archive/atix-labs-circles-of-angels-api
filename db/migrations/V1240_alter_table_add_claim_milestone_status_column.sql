CREATE TYPE ClaimStatus AS ENUM (
  'pending',
  'claimable',
  'claimed',
  'transfered'
);

ALTER TABLE public.milestone ADD COLUMN 'claimStatus' TYPE ClaimStatus DEFAULT 'pending';
UPDATE public.milestone SET claimStatus = 'pending';
