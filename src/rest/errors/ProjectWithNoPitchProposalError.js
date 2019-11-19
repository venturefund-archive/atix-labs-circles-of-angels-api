const COAError = require('./COAError').default;

module.exports = class ProjectWithNoPitchProposalError extends COAError {
  constructor(errorDescription) {
    super('Project with no pitch proposal error', errorDescription);
  }
};
