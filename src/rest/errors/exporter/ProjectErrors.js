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
  })
};
