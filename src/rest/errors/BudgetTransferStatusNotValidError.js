module.exports = class BudgetTransferStatusNotValidError extends Error {
  constructor(errorDescription) {
    super('There was an error while manipulating milestones', errorDescription);
  }
};
