module.exports = {
  InvalidEmail: {
    message: 'Invalid email',
    statusCode: 400
  },
  InvalidUserOrPassword: {
    message: 'Invalid user or password',
    statusCode: 400
  },
  EmailAlreadyInUse: {
    message: 'The email is already in use',
    statusCode: 400
  },
  UserNotFound: {
    message: 'User is not found',
    statusCode: 400
  },
  UserRejected: {
    message: 'User is blocked',
    statusCode: 403
  },
  UserUpdateError: {
    message: 'Unable to update the user'
  },
  CreateProjectFieldsNotValid: {
    message: 'The create project fields are not valid',
    statusCode: 400
  },
  RequiredParamsMissing: method => ({
    message: `Required params are missing for method ${method}`,
    statusCode: 400
  }),
  ImgFileTyPeNotValid: {
    message: 'The image file type is not a valid one',
    statusCode: 400
  },
  MilestoneFileTypeNotValid: {
    message: 'The milestone file type is not a valid one',
    statusCode: 400
  },
  ImgSizeBiggerThanAllowed: {
    message: 'The image size is bigger than allowed',
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
  CantUpdateMilestone: milestoneId => ({
    message: `Cant update milestone with id ${milestoneId}`
  }),
  MilestoneFileHasBeenAlreadyUploaded: {
    message: 'Milestone file has been already uploaded',
    statusCode: 400
  },
  InvalidStatusForMilestoneFileProcess: {
    message: 'Cant process milestone file when project has been published',
    statusCode: 400
  },
  CantFindModelWithId: (model, id) => ({
    message: `Cant find ${model} with id ${id}`,
    statusCode: 400
  }),
  UserIsNotOwnerOfProject: {
    message: 'The user is not the project´s owner',
    statusCode: 403
  },
  MilestoneDoesNotBelongToProject: {
    message: 'Milestone does not belong to project'
  },
  UnauthorizedUserRole: role => ({
    message: `User of role ${role} is not allowed to execute this operation`,
    statusCode: 403
  }),
  ProjectCantReceiveTransfers: status => ({
    message: `Project with status ${status} can't receive transfers`,
    statusCode: 403
  }),
  TransferIdAlreadyExists: transferId => ({
    message: `There is another PENDING or VERIFIED transfer with the same transferId ${transferId}`,
    statusCode: 403
  }),
  TransferStatusNotValid: status => ({
    message: `Transfer status '${status}' is not a valid value`,
    statusCode: 403
  }),
  TransferStatusCannotChange: status => ({
    message: `A transfer of status '${status}' can't be updated`,
    statusCode: 403
  }),
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
  CantCreateTransfer: {
    message: "Couldn't create transfer"
  },
  ErrorGetting: model => ({
    message: `Error getting ${model}`,
    statusCode: 500
  }),
  InvalidProjectTransition: {
    message: 'Project status transition is not valid',
    statusCode: 400
  },
  ProjectCantBeUpdated: status => ({
    message: `Project with status ${status} can't be updated`,
    statusCode: 403
  })
};
