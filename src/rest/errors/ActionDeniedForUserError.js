const COAError = require('./COAError').default;

module.exports = class ActionDeniedForUserError extends COAError {
  constructor(errorDescription) {
    super('Accion denied for user', errorDescription);
  }
};
