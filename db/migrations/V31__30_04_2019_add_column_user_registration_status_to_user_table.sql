ALTER TABLE public."user" ADD COLUMN user_registration_status int4 NOT NULL DEFAULT 0;
ALTER TABLE public."user" ADD CONSTRAINT fk_user_registration_status FOREIGN KEY (user_registration_status) REFERENCES user_registration_status (id);