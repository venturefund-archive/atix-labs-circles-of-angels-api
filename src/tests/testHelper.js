const {
  project,
  milestone,
  activity,
  userAdmin,
  userOracle,
  userFunder,
  userSE
} = require('./mockModels');

const { projectStatus, blockchainStatus } = require('../rest/util/constants');

exports.buildUserSe = ({ id }) => {
  const user = JSON.parse(JSON.stringify(userSE));
  user.id = id ? id : user.id;
  return user;
};

exports.buildActivity = ({ id, blockchainStatus, oracle }) => {
  let newActivity = JSON.parse(JSON.stringify(activity));
  newActivity.id = id ? id : newActivity.id;
  newActivity.blockchainStatus = blockchainStatus
    ? blockchainStatus
    : newActivity.blockchainStatus;
  newActivity.oracle = oracle ? oracle : newActivity.oracle;

  return newActivity;
};
exports.buildMilestone = (cantActivities, { id, blockchainStatus }) => {
  let newMilestone = JSON.parse(JSON.stringify(milestone));
  newMilestone.id = id ? id : newMilestone.id;
  newMilestone.blockchaixnStatus = blockchainStatus
    ? blockchainStatus
    : newMilestone.blockchainStatus;

  for (let j = 1; j <= cantActivities; j++) {
    const newActivity = this.buildActivity({ id: j });
    newMilestone.activities.push(newActivity);
  }

  return newMilestone;
};

exports.buildProject = (
  cantMilestones,
  cantActivities,
  { id, blockchainStatus, status }
) => {
  let newProject = JSON.parse(JSON.stringify(project));

  newProject.id = id ? id : newProject.id;
  newProject.status = status ? status : newProject.status;
  newProject.blockchainStatus = blockchainStatus
    ? blockchainStatus
    : newProject.blockchainStatus;
  for (let i = 1; i <= cantMilestones; i++) {
    const newMilestone = this.buildMilestone(cantActivities, { id: i });
    newProject.milestones.push(newMilestone);
  }
  return newProject;
};

//do not modify, only can extend list of projects
exports.getMockProjects = () => {
  return [
    this.buildProject(1, 1, { id: 1, status: projectStatus.IN_PROGRESS }),
    this.buildProject(1, 1, {
      id: 2,
      status: projectStatus.PENDING_APPROVAL
    }),
    this.buildProject(1, 1, { id: 3, status: projectStatus.REJECTED }),
    this.buildProject(1, 1, { id: 4, status: projectStatus.PUBLISHED }),
    this.buildProject(1, 1, {
      id: 5,
      blockchainStatus: blockchainStatus.CONFIRMED
    }),
    this.buildProject(1, 1, {
      id: 6,
      blockchainStatus: blockchainStatus.PENDING
    }),
    this.buildProject(1, 1, { id: 7, blockchainStatus: blockchainStatus.SENT })
  ];
};
