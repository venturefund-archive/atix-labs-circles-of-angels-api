module.exports = class ProjectHasAlreadyStartedError extends Error {
  constructor(errorDescription) {
    super('There was an error while manipulating milestones', errorDescription);
  }
};
