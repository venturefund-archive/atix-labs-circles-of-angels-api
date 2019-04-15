const evidenceFileTypes = {
  FILE: 'File',
  PHOTO: 'Photo'
};

const transferStatus = {
  RECONCILIATION: 'Reconciliaton',
  PENDING_VERIFICATION: 'Pending Verification',
  CANCELLED: 'Cancelled',
  VERIFIED: 'Verified'
};

const projectStatus = {
  REJECTED: 1,
  PENDING_APPROVAL: 0,
  PUBLISHED: 2,
  IN_PROGRESS: 3
};

module.exports = {
  evidenceFileTypes,
  transferStatus,
  projectStatus
};
