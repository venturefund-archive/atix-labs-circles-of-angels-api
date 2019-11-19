const COAError = require('./COAError').default;

module.exports = class UserRejectedError extends COAError {
  constructor(errorDescription) {
    super('There was an error while manipulating users', errorDescription);
  }
};
