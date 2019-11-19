const COAError = require('./COAError').default;

module.exports = class ProjectNotFoundError extends COAError {
  constructor(errorDescription) {
    super('Project not found', errorDescription);
  }
};
