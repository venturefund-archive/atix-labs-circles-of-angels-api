/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { blockchainStatus } = require('../util/constants');

const saveActivity = activityModel => async (activity, milestoneId) => {
  const toSave = {
    ...activity,
    milestone: milestoneId,
    status: 1,
    blockchainStatus: 1
  };
  const createdActivity = await activityModel.create(toSave);
  return createdActivity;
};

const getActivityById = activityModel => async activityId => {
  const activity = await activityModel.findOne({ id: activityId });
  return activity;
};

const updateActivity = activityModel => async (activity, activityId) => {
  const toUpdate = { ...activity };

  const savedActivity = await activityModel
    .updateOne({ id: activityId })
    .set({ ...toUpdate });

  return savedActivity;
};

const deleteActivity = activityModel => async activityId => {
  const deleted = activityModel.destroyOne(activityId);
  return deleted;
};

const updateStatus = activityModel => async (activityId, status) =>
  activityModel.updateOne({ id: activityId }).set({ status });

const updateTransactionHash = activityModel => async (
  activityId,
  transactionHash
) => activityModel.updateOne({ id: activityId }).set({ transactionHash });

const updateBlockchainStatus = activityModel => async (activityId, bcStatus) =>
  activityModel
    .updateOne({ id: activityId })
    .set({ blockchainStatus: bcStatus });

const whichUnconfirmedActivities = activityModel => async activitiesIds => {
  return activityModel.find({
    where: {
      id: activitiesIds,
      blockchainStatus: { '!=': blockchainStatus.CONFIRMED }
    }
  });
};

const updateCreationTransactionHash = activityModel => async (
  activityId,
  transactionHash
) => activityModel.updateOne({ id: activityId }).set({ transactionHash });

module.exports = activityModel => ({
  saveActivity: saveActivity(activityModel),
  updateActivity: updateActivity(activityModel),
  getActivityById: getActivityById(activityModel),
  deleteActivity: deleteActivity(activityModel),
  updateStatus: updateStatus(activityModel),
  updateTransactionHash: updateTransactionHash(activityModel),
  updateBlockchainStatus: updateBlockchainStatus(activityModel),
  whichUnconfirmedActivities: whichUnconfirmedActivities(activityModel),
  updateCreationTransactionHash: updateCreationTransactionHash(activityModel)
});
