const COAError = require('./COAError').default;

module.exports = class UpdatingAgreementError extends COAError {
  constructor(errorDescription) {
    super('Error updating agreement', errorDescription);
  }
};
