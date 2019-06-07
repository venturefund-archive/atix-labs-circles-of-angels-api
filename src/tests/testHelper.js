const configs = require('config');
const {
  project,
  milestone,
  activity,
  photos,
  userAdmin,
  userOracle,
  userFunder,
  userSE
} = require('./mockModels');

const { projectStatus, blockchainStatus } = require('../rest/util/constants');

exports.buildUserSe = ({ id }) => {
  const user = JSON.parse(JSON.stringify(userSE));
  user.id = id || user.id;
  return user;
};

exports.buildActivity = ({ id, blockchainStatus, oracle }) => {
  const newActivity = JSON.parse(JSON.stringify(activity));
  newActivity.id = id || newActivity.id;
  newActivity.blockchainStatus =
    blockchainStatus || newActivity.blockchainStatus;
  newActivity.oracle = oracle || newActivity.oracle;

  return newActivity;
};
exports.buildMilestone = (
  cantActivities,
  { projectId, id, blockchainStatus }
) => {
  const newMilestone = JSON.parse(JSON.stringify(milestone));
  newMilestone.id = id || newMilestone.id;
  newMilestone.blockchainStatus =
    blockchainStatus || newMilestone.blockchainStatus;

  for (let j = 1; j <= cantActivities; j++) {
    const newActivity = this.buildActivity({ id: j });
    newMilestone.activities.push(newActivity);
  }

  return newMilestone;
};

exports.buildProject = (
  cantMilestones,
  cantActivities,
  {
    id,
    blockchainStatus,
    status,
    ownerId,
    projectName,
    pitchProposal,
    milestonesFile,
    projectAgreement
  }
) => {
  const newProject = JSON.parse(JSON.stringify(project));
  newProject.pitchProposal = pitchProposal || newProject.pitchProposal;
  newProject.milestonesFile = milestonesFile || newProject.milestonesFile;
  newProject.projectAgreement = projectAgreement || newProject.projectAgreement;
  newProject.projectName = projectName || newProject.projectName;
  newProject.id = id || newProject.id;
  newProject.status = status !== undefined ? status : newProject.status;
  newProject.blockchainStatus = blockchainStatus || newProject.blockchainStatus;
  newProject.ownerId = ownerId || newProject.ownerId;
  for (let i = 1; i <= cantMilestones; i++) {
    const newMilestone = this.buildMilestone(cantActivities, { id: i });
    newProject.milestones.push(newMilestone);
  }
  return newProject;
};

exports.getPhoto = id => photos.find(photo => photo.id === id);

// do not modify, only can extend list of projects
exports.getMockProjects = () => [
  this.buildProject(1, 1, { id: 1, status: projectStatus.IN_PROGRESS }),
  this.buildProject(1, 1, {
    id: 2,
    status: projectStatus.PENDING_APPROVAL
  }),
  this.buildProject(1, 1, { id: 3, status: projectStatus.REJECTED }),
  this.buildProject(1, 1, { id: 4, status: projectStatus.PUBLISHED }),
  this.buildProject(1, 1, {
    id: 5,
    blockchainStatus: blockchainStatus.CONFIRMED,
    status: projectStatus.PUBLISHED
  }),
  this.buildProject(1, 1, {
    id: 6,
    blockchainStatus: blockchainStatus.PENDING
  }),
  this.buildProject(1, 1, { id: 7, blockchainStatus: blockchainStatus.SENT })
];

exports.getMockFiles = () => ({
  projectCoverPhoto: {
    name: 'projectCoverPhoto.png',
    path: `${configs.fileServer.filePath}/projectCoverPhoto.png`,
    mv: jest.fn()
  },
  projectCardPhoto: {
    name: 'projectCardPhoto.png',
    path: `${configs.fileServer.filePath}/projectCardPhoto.png`,
    mv: jest.fn()
  },
  projectProposal: {
    name: 'projectProposal.pdf',
    path: `${configs.fileServer.filePath}/projectProposal.pdf`,
    mv: jest.fn()
  },
  projectAgreement: {
    name: 'projectAgreement.pdf',
    path: `${configs.fileServer.filePath}/projectAgreement.pdf`,
    mv: jest.fn()
  },
  projectMilestones: {
    name: 'projectMilestones.xlsx',
    path: `${configs.fileServer.filePath}/projectMilestones.xlsx`,
    mv: jest.fn()
  },
  milestonesErrors: {
    name: 'milestonesErrors.xlsx',
    path: `${configs.fileServer.filePath}/milestonesErrors.xlsx`,
    mv: jest.fn()
  }
});
