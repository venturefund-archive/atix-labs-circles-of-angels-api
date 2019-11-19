const COAError = require('./COAError').default;

module.exports = class GettingTotalFundedError extends COAError {
  constructor(errorDescription) {
    super('Getting total funded error', errorDescription);
  }
};
