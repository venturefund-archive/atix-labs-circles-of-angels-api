const evidenceFileTypes = {
  FILE: 'File',
  PHOTO: 'Photo'
};

const transferStatus = {
  CANCELLED: { status: -1, name: 'Cancelled' },
  PENDING_VERIFICATION: { status: 0, name: 'Pending Verification' },
  RECONSILIATION: { status: 1, name: 'Reconsiliaton' },
  VERIFIED: { status: 2, name: 'Verified' }
};

const projectStatus = {
  REJECTED: { status: -1, name: 'Rejected' },
  PENDING_APPROVAL: { status: 0, name: 'Pending Approval' },
  PUBLISHED: { status: 1, name: 'Published' },
  IN_PROGRESS: { status: 2, name: 'In Progress' }
};

module.exports = {
  evidenceFileTypes,
  transferStatus,
  projectStatus
};
