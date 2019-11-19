const COAError = require('./COAError').default;

module.exports = class InvalidBlockchainStatusError extends COAError {
  constructor(errorDescription) {
    super('Invalid blockchain status error', errorDescription);
  }
};
