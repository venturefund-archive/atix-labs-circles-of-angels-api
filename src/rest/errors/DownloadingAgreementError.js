const COAError = require('./COAError').default;

module.exports = class DownloadingAgreementError extends COAError {
  constructor(errorDescription) {
    super('Error downloading agreement', errorDescription);
  }
};
