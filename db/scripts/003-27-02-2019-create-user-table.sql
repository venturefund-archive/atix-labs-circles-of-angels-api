CREATE TABLE public.user (
	id SERIAL PRIMARY KEY,
	username varchar NOT NULL,
	email varchar NOT NULL,
	pwd varchar NOT NULL,
	userId int8 NOT NULL,
	createdAt date NULL,
	updatedAt date NULL
);
