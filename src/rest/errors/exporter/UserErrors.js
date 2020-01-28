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
  UserIsNotOwnerOfProject: {
    message: 'The user is not the project´s owner',
    statusCode: 403
  },
  UnauthorizedUserRole: role => ({
    message: `User of role ${role} is not allowed to execute this operation`,
    statusCode: 403
  }),
  IsNotProjectCurator: {
    message: 'The user is not a Project Curator',
    statusCode: 403
  }
};
