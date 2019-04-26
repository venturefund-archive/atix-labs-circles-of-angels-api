ALTER TABLE milestone_activity_status ALTER COLUMN "status" TYPE int4;
ALTER TABLE milestone_activity_status ADD PRIMARY KEY ("status");