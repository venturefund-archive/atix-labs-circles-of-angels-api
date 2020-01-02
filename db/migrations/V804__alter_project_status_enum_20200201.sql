ALTER TYPE ProjectStatus ADD VALUE 'new';
ALTER TYPE ProjectStatus ADD VALUE 'toreview';
ALTER TYPE ProjectStatus ADD VALUE 'executing';

UPDATE public.project SET status = 'new' WHERE status = 'draft';
UPDATE public.project SET status = 'toreview' WHERE status = 'pending';
UPDATE public.project SET status = 'executing' WHERE status = 'ongoing';

ALTER TYPE ProjectStatus RENAME TO ProjectStatusOld;

CREATE TYPE ProjectStatus AS ENUM (
  'new',
  'toreview',
  'rejected',
  'deleted',
  'published',
  'consensus',
  'funding',
  'executing',
  'changingscope',
  'finished',
  'aborted',
  'archived',
  'cancelled'
);

ALTER TABLE public.project ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.project ALTER COLUMN status TYPE ProjectStatus USING status::text::ProjectStatus;
ALTER TABLE public.project ALTER COLUMN status SET DEFAULT 'new';

DROP TYPE ProjectStatusOld;