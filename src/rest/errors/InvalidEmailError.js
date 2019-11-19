const COAError = require('./COAError');

module.exports = class InvalidEmailError extends COAError {
  constructor(errorDescription) {
    super('There was an error while manipulating users', errorDescription);
  }
};
