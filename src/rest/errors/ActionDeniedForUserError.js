const COAError = require('./COAError');

module.exports = class ActionDeniedForUserError extends COAError {
  constructor(errorDescription) {
    super('Accion denied for user', errorDescription);
  }
};
