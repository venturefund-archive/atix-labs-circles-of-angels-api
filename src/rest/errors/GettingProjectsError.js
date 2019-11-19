const COAError = require('./COAError').default;

module.exports = class GettingProjectsError extends COAError {
  constructor(errorDescription) {
    super('Getting projects error', errorDescription);
  }
};
