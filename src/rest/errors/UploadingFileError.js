const COAError = require('./COAError').default;

module.exports = class UploadingFileError extends COAError {
  constructor(errorDescription) {
    super('Uploading file error', errorDescription);
  }
};
