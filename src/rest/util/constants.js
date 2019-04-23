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
  IDLE: 1,
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

module.exports = {
  evidenceFileTypes,
  transferStatus,
  projectStatus,
  activityStatus,
  userRoles
};
