const COAError = require('./COAError');

module.exports = class ProjectNotUpdatedError extends COAError {
  constructor(errorDescription) {
    super('Project not updated', errorDescription);
  }
};
