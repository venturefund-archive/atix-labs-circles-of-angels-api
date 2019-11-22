const ErrorTypes = {
    ProjectNotFoundError: 'ProjectNotFoundError',
    CouldNotReadProject: 'CouldNotReadProject'
  };
  
  const Errors = {
    ProjectNotFoundError: {
      type: ErrorTypes.ProjectNotCreatedError
    },
    CouldNotReadProject: {
      type: ErrorTypes.CouldNotReadProject
    }
  };
  
module.exports = { Errors, ErrorTypes };
  