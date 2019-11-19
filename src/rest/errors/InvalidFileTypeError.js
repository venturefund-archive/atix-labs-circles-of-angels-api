const COAError = require('./COAError').default;

module.exports = class InvalidFileTypeError extends COAError {
  constructor(errorDescription) {
    super('Invalid file type', errorDescription);
  }
};
