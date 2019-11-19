const COAError = require('./COAError').default;

module.exports = class DownloadingProposalError extends COAError {
  constructor(errorDescription) {
    super('Downloading proposal error', errorDescription);
  }
};
