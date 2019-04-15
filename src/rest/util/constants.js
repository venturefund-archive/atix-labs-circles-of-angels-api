const evidenceFileTypes = {
  FILE: 'File',
  PHOTO: 'Photo'
};

const transferStatus = {
  RECONCILIATION: 1,
  PENDING_VERIFICATION: 0,
  CANCELLED: -1,
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

module.exports = {
  evidenceFileTypes,
  transferStatus,
  projectStatus,
  activityStatus
};
