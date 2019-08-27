ALTER TABLE transfer_status ALTER COLUMN "status" TYPE int4;
ALTER TABLE transfer_status ADD PRIMARY KEY ("status");