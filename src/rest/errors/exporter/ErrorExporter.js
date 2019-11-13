module.exports = {
  COAError: require('../COAError'),
  InvalidEmailError: require('../InvalidEmailError'),
  QuestionnaireNotFoundError: require('../QuestionnaireNotFoundError'),
  UpdateUserError: require('../UpdateUserError'),
  UserAlreadyExistsError: require('../UserAlreadyExistsError'),
  UserNotFoundError: require('../UserNotFoundError'),
  UserRejectedError: require('../UserRejectedError'),
  UserRoleDoesNotExistsError: require('../UserRoleDoesNotExistsError'),
  UserStillNeedsApprovalError: require('../UserStillNeedsApprovalError'),
  UserWithoutRoleError: require('../UserWithoutRoleError'),
  BudgetTransferStatusNotValidError: require('../BudgetTransferStatusNotValidError'),
  MandatoryFieldsEmptyError: require('../MandatoryFieldsEmptyError'),
  MilestoneBudgetStatusIsNotValidError: require('../MilestoneBudgetStatusIsNotValidError'),
  MilestoneNotFoundError: require('../MilestoneNotFoundError'),
  PreviousMilestonesAreNotAllFundedError: require('../PreviousMilestonesAreNotAllFundedError'),
  ProjectHasAlreadyStartedError: require('../ProjectHasAlreadyStartedError'),
  ProjectStatusNotValidError: require('../ProjectStatusNotValidError')
};
