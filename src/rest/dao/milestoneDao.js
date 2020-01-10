/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async findById(milestoneId) {
    const milestone = await this.model.findOne({ id: milestoneId });
    return milestone;
  },
  async getMilestoneByIdWithProject(milestoneId) {
    const milestone = await this.model
      .findOne({ id: milestoneId })
      .populate('project');

    return milestone;
  },
  async getMilestoneByProjectId(project) {
    return this.model.find({ project }).populate('tasks');
  },
  async saveMilestone({ milestone, projectId }) {
    const toSave = {
      ...milestone,
      project: projectId
    };
    const createdMilestone = await this.model.create(toSave);
    return createdMilestone;
  },
  async updateMilestone(milestone, milestoneId) {
    const toUpdate = { ...milestone };

    const savedMilestone = await this.model
      .updateOne({ id: milestoneId })
      .set({ ...toUpdate });

    return savedMilestone;
  },
  async deleteMilestone(milestoneId) {
    const deleted = await this.model.destroyOne(milestoneId);
    return deleted;
  },

  // FIXME : unclear name
  async getMilestoneActivities(milestoneId) {
    const milestone = await this.model
      .findOne({ id: milestoneId })
      .populate('tasks');

    return milestone || [];
  },
  async getMilestonesByProject(projectId) {
    const milestones = await this.model
      .find({ project: projectId })
      .sort('id ASC');
    return milestones;
  },

  async updateMilestoneStatus(milestoneId, status) {
    this.model.update(milestoneId).set({ status });
  },
  async getAllMilestones() {
    const milestones = await this.model
      .find()
      .populate('project')
      .populate('tasks')
      .sort('createdAt DESC');

    return milestones || [];
  },
  async updateBudgetStatus(milestoneId, budgetStatusId) {
    const milestone = await this.model
      .updateOne({ id: milestoneId })
      .set({ budgetStatus: budgetStatusId });

    return milestone;
  },

  async updateBlockchainStatus(milestoneId, blockchainStatus) {
    this.model.updateOne({ id: milestoneId }).set({ blockchainStatus });
  },
  async updateCreationTransactionHash(milestoneId, transactionHash) {
    this.model.updateOne({ id: milestoneId }).set({ transactionHash });
  }
};
