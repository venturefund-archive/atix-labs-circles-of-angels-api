const COAError = require('./COAError').default;

module.exports = class UploadingExperienceError extends COAError {
  constructor(errorDescription) {
    super('Uploading experience error', errorDescription);
  }
};
