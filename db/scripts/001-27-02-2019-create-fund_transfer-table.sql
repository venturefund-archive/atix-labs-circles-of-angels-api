CREATE TABLE public.fund_transfer (
	id SERIAL PRIMARY KEY,
	transferId varchar NOT NULL,
	senderId varchar NOT NULL,
	destinationAccount varchar NOT NULL,
	currency varchar NOT NULL,
	projectId int8 NOT NULL,
	state int2 NOT NULL,
	createdAt date NULL,
	updatedAt date NULL,
	amount int8 NOT NULL
);
