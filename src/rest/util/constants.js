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
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  PUBLISHED: 3,
  IN_PROGRESS: 4
};

const projectStatuses = {
  NEW: 'new',
  TO_REVIEW: 'toreview',
  REJECTED: 'rejected',
  DELETED: 'deleted',
  PUBLISHED: 'published',
  CONSENSUS: 'consensus',
  FUNDING: 'funding',
  EXECUTING: 'executing',
  CHANGING_SCOPE: 'changingscope',
  FINISHED: 'finished',
  ABORTED: 'aborted',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled'
  // TODO this status might be a boolean field in project table
  // SUSPENDED: 'suspended'
};

const activityStatus = {
  PENDING: 1,
  STARTED: 2,
  VERIFIED: 3,
  COMPLETED: 4
};

const txFunderStatus = {
  PENDING: 'pending',
  RECONCILIATION: 'reconciliation',
  CANCELLED: 'cancelled',
  VERIFIED: 'verified'
};

const userRoles = {
  COA_ADMIN: 'admin',
  ENTREPRENEUR: 'entrepreneur',
  PROJECT_SUPPORTER: 'supporter',
  PROJECT_CURATOR: 'curator',
  BANK_OPERATOR: 'bankoperator'
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
  txFunderStatus,
  transferStatus,
  projectStatus,
  projectStatuses,
  activityStatus,
  userRoles,
  milestoneBudgetStatus,
  blockchainStatus,
  xlsxConfigs,
  transactionTypes
};
