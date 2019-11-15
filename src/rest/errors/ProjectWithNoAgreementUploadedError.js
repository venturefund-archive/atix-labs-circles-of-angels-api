const COAError = require('./COAError');

module.exports = class ProjectWithNoAgreementUploadesError extends COAError {
  constructor(errorDescriptor) {
    super('Project does not have an agreement uploaded', errorDescriptor);
  }
};
