module.exports = class COAUserServiceError extends Error {
  constructor(errorDescription) {
    super(errorDescription);
    this.errorDescription = 'There was an error while manipulating users';
  }
};
