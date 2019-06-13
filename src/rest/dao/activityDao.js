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

  delete toUpdate.id;
  delete toUpdate.milestone;
  delete toUpdate.blockchainStatus;

  toUpdate.status = toUpdate.status || 1;
  toUpdate.blockchainStatus = toUpdate.blockchainStatus || 1;

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
  activityModel.update(activityId).set({ status });
const updateStatusWithTransaction = activityModel => async (
  activityId,
  status,
  transactionHash
) => activityModel.update(activityId).set({ status, transactionHash });

const updateBlockchainStatus = activityModel => async (
  activityId,
  blockchainStatus
) => activityModel.updateOne({ id: activityId }).set({ blockchainStatus });

const whichUnconfirmedActivities = activityModel => async activitiesIds => {
  return activityModel.find({
    where: {
      id: activitiesIds,
      blockchainStatus: { '!=': blockchainStatus.CONFIRMED }
    }
  });
};

module.exports = activityModel => ({
  saveActivity: saveActivity(activityModel),
  updateActivity: updateActivity(activityModel),
  getActivityById: getActivityById(activityModel),
  deleteActivity: deleteActivity(activityModel),
  updateStatus: updateStatus(activityModel),
  updateStatusWithTransaction: updateStatusWithTransaction(activityModel),
  updateBlockchainStatus: updateBlockchainStatus(activityModel),
  whichUnconfirmedActivities: whichUnconfirmedActivities(activityModel)
});
