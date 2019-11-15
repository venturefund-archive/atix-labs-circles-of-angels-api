const COAError = require('./COAError');

module.exports = class DownloadingAgreementError extends COAError {
  constructor(errorDescription) {
    super('Error downloading agreement', errorDescription);
  }
};
