const MilestoneDao = () => ({
  milestoneModel: require('../server').fastify.models.milestone,

  async saveMilestone(milestone, projectId) {
    milestone.project = projectId;
    const createdMilestone = await this.milestoneModel.create(milestone);
    return createdMilestone;
  }
});

module.exports = MilestoneDao;
