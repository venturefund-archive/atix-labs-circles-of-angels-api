ALTER TABLE user RENAME COLUMN username TO firstname;
ALTER TABLE user ADD COLUMN lastname NOT NULL DEFAULT '';