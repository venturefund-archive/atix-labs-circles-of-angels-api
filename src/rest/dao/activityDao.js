/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { blockchainStatus } = require('../util/constants');

module.exports = {
  async saveActivity(activity, milestoneId) {
    const toSave = {
      ...activity,
      milestone: milestoneId,
      status: 1,
      blockchainStatus: 1
    };
    const createdActivity = await this.model.create(toSave);
    return createdActivity;
  },

  async getActivityById(activityId) {
    const activity = await this.model.findOne({ id: activityId });
    return activity;
  },

  async updateActivity(activity, activityId) {
    const toUpdate = { ...activity };

    const savedActivity = await this.model
      .updateOne({ id: activityId })
      .set({ ...toUpdate });

    return savedActivity;
  },

  async deleteActivity(activityId) {
    const deleted = this.model.destroyOne(activityId);
    return deleted;
  },

  async updateStatus(activityId, status) {
    return this.model.updateOne({ id: activityId }).set({ status });
  },
  async updateTransactionHash(activityId, transactionHash) {
    return this.model.updateOne({ id: activityId }).set({ transactionHash });
  },

  async updateBlockchainStatus(activityId, bcStatus) {
    return this.model
      .updateOne({ id: activityId })
      .set({ blockchainStatus: bcStatus });
  },

  async whichUnconfirmedActivities(activitiesIds) {
    return this.model.find({
      where: {
        id: activitiesIds,
        blockchainStatus: { '!=': blockchainStatus.CONFIRMED }
      }
    });
  },

  async updateCreationTransactionHash(activityId, transactionHash) {
    return this.model.updateOne({ id: activityId }).set({ transactionHash });
  }
};
