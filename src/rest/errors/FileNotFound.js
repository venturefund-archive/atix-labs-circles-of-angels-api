const COAError = require('./COAError');

module.exports = class FileNotFound extends COAError {
  constructor(errorDescription) {
    super('Reading project error', errorDescription);
  }
};
