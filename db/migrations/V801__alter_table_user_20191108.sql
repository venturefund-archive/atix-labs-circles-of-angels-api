ALTER TABLE public.user RENAME COLUMN username TO firstname;
ALTER TABLE public.user ADD COLUMN lastname NOT NULL DEFAULT '';