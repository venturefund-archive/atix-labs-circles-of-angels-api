const COAError = require('./COAError').default;

module.exports = class ProjectWithNoAgreementError extends COAError {
  constructor(errorDescription) {
    super('Project with no agreement error', errorDescription);
  }
};
