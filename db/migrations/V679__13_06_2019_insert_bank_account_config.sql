ALTER TABLE configs ALTER "value" DROP NOT NULL;
INSERT INTO configs ("key") VALUES('coa_bank_account_address');
INSERT INTO configs ("key") VALUES('coa_bank_account_bank_name');
INSERT INTO configs ("key") VALUES('coa_bank_account_owner_name');