ALTER TYPE ROLE ADD VALUE 'supporter';
ALTER TYPE ROLE ADD VALUE 'curator';
ALTER TYPE ROLE ADD VALUE 'bankoperator';

UPDATE public.user SET role = 'supporter' WHERE role = 'oracle' OR role = 'funder';

ALTER TYPE ROLE RENAME TO ROLE_OLD;

CREATE TYPE ROLE AS ENUM(
  'admin',
  'entrepreneur',
  'supporter',
  'curator',
  'bankoperator'
);

ALTER TABLE public.user ALTER COLUMN role TYPE ROLE USING role::text::ROLE;

DROP TYPE ROLE_OLD;