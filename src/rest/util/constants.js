/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const evidenceFileTypes = {
  FILE: 'File',
  PHOTO: 'Photo'
};

const transferStatus = {
  RECONCILIATION: 1,
  PENDING_VERIFICATION: 0,
  CANCELLED: 3,
  VERIFIED: 2
};

const projectStatus = {
  // TODO delete this one
  REJECTED: 2,
  EDITING: 0,
  PENDING_APPROVAL: 1,
  PUBLISHED: 3,
  IN_PROGRESS: 4
};

const projectStatusType = {
  EDITING: 'editing',
  PENDING: 'pending',
  CONSENSUS: 'consensus',
  ONGOING: 'ongoing'
};

const activityStatus = {
  PENDING: 1,
  STARTED: 2,
  VERIFIED: 3,
  COMPLETED: 4
};

const userRoles = {
  BO_ADMIN: 'admin',
  ENTREPRENEUR: 'entrepreneur',
  FUNDER: 'funder',
  ORACLE: 'oracle'
};

const milestoneBudgetStatus = {
  CLAIMABLE: 1,
  CLAIMED: 2,
  FUNDED: 3,
  BLOCKED: 4
};

const blockchainStatus = {
  PENDING: 1,
  SENT: 2,
  CONFIRMED: 3,
  ABORTED: 4
};

const xlsxConfigs = {
  keysMap: {
    A: 'quarter',
    C: 'tasks',
    D: 'impact',
    E: 'impactCriterion',
    F: 'signsOfSuccess',
    G: 'signsOfSuccessCriterion',
    H: 'budget',
    I: 'category',
    J: 'keyPersonnel'
  },
  columnNames: {
    quarter: 'Timeline',
    tasks: 'Tasks',
    impact: 'Expected Changes/ Social Impact Targets',
    impactCriterion: 'Review Criterion for the Expected Changes',
    signsOfSuccess: 'Signs of Success',
    signsOfSuccessCriterion: 'Review Criterion for the Signs of Success',
    budget: 'Budget needed',
    category: 'Expenditure Category',
    keyPersonnel: 'Key Personnel Responsible'
  },
  typeColumnKey: 'B',
  startRow: 4
};

const transactionTypes = {
  projectCreation: 'projectCreation',
  milestoneCreation: 'milestoneCreation',
  activityCreation: 'activityCreation',
  milestoneClaimed: 'milestoneClaimed',
  projectStarted: 'projectStarted',
  milestoneFunded: 'milestoneFunded',
  validateActivity: 'validateActivity',
  updateEvidence: 'updateEvidence'
};

module.exports = {
  evidenceFileTypes,
  transferStatus,
  projectStatus,
  activityStatus,
  userRoles,
  milestoneBudgetStatus,
  blockchainStatus,
  xlsxConfigs,
  projectStatusType,
  transactionTypes
};
