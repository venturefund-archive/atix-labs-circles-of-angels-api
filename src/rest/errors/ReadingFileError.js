const COAError = require('./COAError').default;

module.exports = class ReadingFileError extends COAError {
  constructor(errorDescription) {
    super('Reading file error', errorDescription);
  }
};
