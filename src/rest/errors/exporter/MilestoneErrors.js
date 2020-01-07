module.exports = {
  CantUpdateMilestone: milestoneId => ({
    message: `Cant update milestone with id ${milestoneId}`
  }),
  MilestoneDoesNotBelongToProject: {
    message: 'Milestone does not belong to project'
  },
  CantProcessMilestonesFile: {
    message: 'The milestone file cannot be processed'
  },
  ErrorProcessingMilestonesFile: {
    message: 'An error occurred while processing the milestones file'
  },
  ErrorCreatingMilestonesFromFile: {
    message: 'Error creating milestones from file'
  }
};
