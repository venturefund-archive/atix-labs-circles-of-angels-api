const COAError = require('./COAError');

module.exports = class FileTypeNotValidError extends COAError {
    constructor(errorDescription) {
        super('Invalid file type', errorDescription);
    }   
}