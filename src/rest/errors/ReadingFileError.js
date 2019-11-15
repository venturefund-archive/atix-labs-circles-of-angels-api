const COAError = require('./COAError');

module.exports = class ReadingFileError extends COAError {
  constructor(errorDescription) {
    super('Reading file error', errorDescription);
  }
};
