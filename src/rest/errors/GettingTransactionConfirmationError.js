const COAError = require('./COAError').default;

module.exports = class GettingTransactionConfirmationError extends COAError {
  constructor(errorDescription) {
    super('Getting transaction confirmation error', errorDescription);
  }
};
