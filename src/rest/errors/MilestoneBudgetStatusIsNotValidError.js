module.exports = class MilestoneBudgetStatusIsNotValidError extends Error {
  constructor(errorDescription) {
    super('There was an error while manipulating milestones', errorDescription);
  }
};
