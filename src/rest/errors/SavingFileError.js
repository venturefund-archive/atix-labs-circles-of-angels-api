const COAError = require('./COAError').default;

module.exports = class SavingFileError extends COAError {
  constructor(errorDescription) {
    super('Saving file error', errorDescription);
  }
};
