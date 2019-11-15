const COAError = require('./COAError');

module.exports =  class ImageSizeNotValidError extends COAError {
    constructor(errorDescription) {
        super('Invalid Image Size', errorDescription);
    }
}
