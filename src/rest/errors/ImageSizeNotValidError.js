const COAError = require('./COAError').default;

module.exports = class ImageSizeNotValidError extends COAError {
  constructor(errorDescription) {
    super('Invalid Image Size', errorDescription);
  }
};
