const COAError = require('./COAError');

module.exports = class ProjectNotFoundError extends COAError {
  constructor(errorDescription) {
    super('Project not found', errorDescription);
  }
};
