const COAError = require('./COAError').default;

module.exports = class ProjectNotCreatedError extends COAError {
  constructor(errorDescription) {
    super('Can not create project', errorDescription);
  }
};
