const COAError = require('./COAError');

module.exports = class UpdatingAgreementError extends COAError {
  constructor(errorDescription) {
    super('Error updating agreement', errorDescription);
  }
};
