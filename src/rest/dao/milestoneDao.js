const MilestoneDao = ({ milestoneModel }) => ({
  async saveMilestone({ milestone, projectId }) {
    milestone.project = projectId;
    const createdMilestone = await milestoneModel.create(milestone);
    return createdMilestone;
  }
});

module.exports = MilestoneDao;
