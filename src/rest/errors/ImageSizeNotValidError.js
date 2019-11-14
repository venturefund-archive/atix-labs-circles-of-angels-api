const COAError = require('./COAError');

module.exports =  class ImageSizeNotValid extends COAError {
    constructor(errorDescription) {
        super('Invalid Image Size', errorDescription);
    }
}
