const COAError = require('./COAError').default;

module.exports = class ProjectNotUpdatedError extends COAError {
  constructor(errorDescription) {
    super('Project not updated', errorDescription);
  }
};
