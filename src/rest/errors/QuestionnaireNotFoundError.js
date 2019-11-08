const COAError = require('./COAError');

module.exports = class QuestionnaireNotFoundError extends COAError {
  constructor(errorDescription) {
    super('There was an error while manipulating users');
    this.errorDescription = errorDescription;
  }
};
