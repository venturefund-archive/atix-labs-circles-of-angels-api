/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { activityStatus, milestoneBudgetStatus } = require('../util/constants');

module.exports = {
  async getMilestoneById(milestoneId) {
    const milestone = await this.model.findOne({ id: milestoneId });
    return milestone;
  },
  async getMilestoneByIdWithProject(milestoneId) {
    const milestone = await this.model
      .findOne({ id: milestoneId })
      .populate('project');

    return milestone;
  },
  async saveMilestone({ milestone, projectId, budgetStatus }) {
    const toSave = {
      ...milestone,
      project: projectId
      // status: activityStatus.PENDING,
      // budgetStatus: budgetStatus || milestoneBudgetStatus.BLOCKED,
      // blockchainStatus: 1
    };
    const createdMilestone = await this.model.create(toSave);
    return createdMilestone;
  },
  async updateMilestone(milestone, milestoneId) {
    const toUpdate = { ...milestone };

    toUpdate.status = toUpdate.status || activityStatus.PENDING;
    toUpdate.budgetStatus =
      toUpdate.budgetStatus || milestoneBudgetStatus.BLOCKED;
    toUpdate.blockchainStatus = toUpdate.blockchainStatus || 1;

    const savedMilestone = await this.model
      .updateOne({ id: milestoneId })
      .set({ ...toUpdate });

    return savedMilestone;
  },
  async getMilestoneActivities(milestoneId) {
    const milestone = await this.model
      .findOne({ id: milestoneId })
      .populate('activities')
      .populate('status')
      .populate('budgetStatus');

    return milestone || [];
  },
  async deleteMilestone(milestoneId) {
    const deleted = await this.model.destroy(milestoneId).fetch();
    return deleted;
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
      .populate('status')
      .populate('project')
      .populate('budgetStatus')
      .sort('id DESC');

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
