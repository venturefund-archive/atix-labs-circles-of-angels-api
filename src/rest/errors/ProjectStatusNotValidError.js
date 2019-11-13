module.exports = class ProjectStatusNotValidError extends Error {
  constructor(errorDescription) {
    super('There was an error while manipulating milestones', errorDescription);
  }
};
