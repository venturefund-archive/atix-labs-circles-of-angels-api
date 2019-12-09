module.exports = {
  InvalidEmail: {
    message: 'Invalid email',
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
  }
};
