const COAError = require('./COAError');

module.exports = class ProjectDoNotExist extends COAError {
  constructor(errorDescription) {
    super('Project do not exist', errorDescription);
  }
};
