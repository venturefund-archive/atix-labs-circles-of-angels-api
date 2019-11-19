module.exports = class COAError extends Error {
  constructor(genericError, errorDescription) {
    super(genericError);
    this.errorDescription = errorDescription;
  }
};
