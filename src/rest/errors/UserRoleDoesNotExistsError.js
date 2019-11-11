const COAError = require('./COAError');

module.exports = class UserRoleDoesNotExistsError extends COAError {
  constructor(errorDescription) {
    super('There was an error while manipulating users', errorDescription);
  }
};
