module.exports = class COAUserServiceError extends Error {
  constructor(errorDescription) {
    super('There was an error while manipulating users');
    this.errorDescription = errorDescription;
  }
};
