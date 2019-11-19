const COAError = require('./COAError').default;

module.exports = class GettingProjectExperiencesError extends COAError {
  constructor(errorDescription) {
    super('Getting project experiences error', errorDescription);
  }
};
