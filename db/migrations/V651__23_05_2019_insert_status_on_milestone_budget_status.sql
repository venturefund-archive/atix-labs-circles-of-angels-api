UPDATE milestone_budget_status SET name='Claimable' WHERE milestone_budget_status.id = 2;
INSERT INTO milestone_budget_status VALUES (3, 'Claimed');
INSERT INTO milestone_budget_status VALUES (4, 'Funded');
INSERT INTO milestone_budget_status VALUES (5, 'Blocked');