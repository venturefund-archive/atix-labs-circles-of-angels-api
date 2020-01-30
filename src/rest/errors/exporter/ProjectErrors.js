module.exports = {
  CreateProjectFieldsNotValid: {
    message: 'The create project fields are not valid',
    statusCode: 400
  },
  CantSaveProject: {
    message: 'Cant save project'
  },
  ProjectIsNotPublishable: {
    message: 'The project is not publishable, it has an invalid status',
    statusCode: 400
  },
  CantUpdateProject: projectId => ({
    message: `Cant update project with id ${projectId}`
  }),
  CantApplyToProject: status => ({
    message: `It doesn't allow apply when the project is in ${status} status`,
    statusCode: 404
  }),
  CantFollowProject: projectId => ({
    message: `Project ${projectId} has't been published yet`,
    statusCode: 404
  }),
  MilestoneFileHasBeenAlreadyUploaded: {
    message: 'Milestone file has been already uploaded',
    statusCode: 400
  },
  InvalidStatusForMilestoneFileProcess: {
    message: 'Cant process milestone file when project has been published',
    statusCode: 400
  },
  ProjectNotApproved: {
    message: 'Project has not been approved yet',
    statusCode: 403
  },
  ProjectDoesntHaveMilestonesFile: projectId => ({
    message: `Project ${projectId} doesn't have milestones file`,
    statusCode: 404
  }),
  MilestonesFileNotFound: (projectId, filepath) => ({
    message: `Milestones file wasn't found for project ${projectId} and path ${filepath}`,
    statusCode: 404
  }),
  InvalidProjectTransition: {
    message: 'Project status transition is not valid',
    statusCode: 400
  },
  ProjectCantBeUpdated: status => ({
    message: `Project with status ${status} can't be updated`,
    statusCode: 403
  }),
  AlreadyProjectFollower: () => ({
    message: 'User already follow this project',
    statusCode: 400
  }),
  AlreadyApplyToProject: () => ({
    message: 'User already apply to this project',
    statusCode: 400
  }),
  IsNotFollower: () => ({
    message: 'User is not following this project',
    statusCode: 400
  }),
  IsNotCompleted: {
    message: 'Project is not completed',
    statusCode: 400
  },
  ChangingStatus: {
    message: 'An error occurred while changing the project status',
    statusCode: 400
  }
};
