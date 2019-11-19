const COAError = require('./COAError').default;

module.exports = class UpdatingBlockchainStatusError extends COAError {
  constructor(errorDescription) {
    super('Updating blockchain status error', errorDescription);
  }
};
