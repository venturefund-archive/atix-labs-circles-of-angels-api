const COAError = require('./COAError');

module.exports = class ProjectNotCreatedError extends COAError {
    constructor(errorDescription) {
        super('Can not create project', errorDescription);
    }
}