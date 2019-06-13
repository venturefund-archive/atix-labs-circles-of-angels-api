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
  REJECTED: 1,
  PENDING_APPROVAL: 0,
  PUBLISHED: 2,
  IN_PROGRESS: 3
};

const activityStatus = {
  PENDING: 1,
  STARTED: 2,
  VERIFIED: 3,
  COMPLETED: 4
};

const userRoles = {
  BO_ADMIN: 1,
  SOCIAL_ENTREPRENEUR: 2,
  IMPACT_FUNDER: 3,
  ORACLE: 4
};

const milestoneBudgetStatus = {
  CLAIMABLE: 1,
  CLAIMED: 2,
  FUNDED: 3,
  BLOCKED: 4
};

const userRegistrationStatus = {
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  REJECTED: 3
};

const blockchainStatus = {
  PENDING: 1,
  SENT: 2,
  CONFIRMED: 3
};

module.exports = {
  evidenceFileTypes,
  transferStatus,
  projectStatus,
  activityStatus,
  userRoles,
  milestoneBudgetStatus,
  userRegistrationStatus,
  blockchainStatus
};
