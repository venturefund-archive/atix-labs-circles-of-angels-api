const COAError = require('./COAError');

module.exports = class FileTypeNotValid extends COAError {
    constructor(errorDescription) {
        super('Invalid file type', errorDescription);
    }   
}