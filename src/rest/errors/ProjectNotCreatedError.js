const COAError = require('./COAError');

module.exports = class ProjectNotCreated extends COAError {
    constructor(errorDescription) {
        super('Can not create project', errorDescription);
    }
}