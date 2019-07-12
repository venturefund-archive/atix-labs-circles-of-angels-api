/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { activityStatus, milestoneBudgetStatus } = require('../util/constants');

const getMilestoneById = milestoneModel => async milestoneId => {
  const milestone = await milestoneModel.findOne({ id: milestoneId });
  return milestone;
};

const getMilestoneByIdWithProject = milestoneModel => async milestoneId => {
  const milestone = await milestoneModel
    .findOne({ id: milestoneId })
    .populate('project');

  return milestone;
};

const saveMilestone = milestoneModel => async ({
  milestone,
  projectId,
  budgetStatus
}) => {
  const toSave = {
    ...milestone,
    project: projectId,
    status: activityStatus.PENDING,
    budgetStatus: budgetStatus || milestoneBudgetStatus.BLOCKED,
    blockchainStatus: 1
  };
  const createdMilestone = await milestoneModel.create(toSave);
  return createdMilestone;
};

const updateMilestone = milestoneModel => async (milestone, milestoneId) => {
  const toUpdate = { ...milestone };

  toUpdate.status = toUpdate.status || activityStatus.PENDING;
  toUpdate.budgetStatus =
    toUpdate.budgetStatus || milestoneBudgetStatus.BLOCKED;
  toUpdate.blockchainStatus = toUpdate.blockchainStatus || 1;

  const savedMilestone = await milestoneModel
    .updateOne({ id: milestoneId })
    .set({ ...toUpdate });

  return savedMilestone;
};

const getMilestoneActivities = milestoneModel => async milestoneId => {
  const milestone = await milestoneModel
    .findOne({ id: milestoneId })
    .populate('activities')
    .populate('status')
    .populate('budgetStatus');

  return milestone || [];
};

const deleteMilestone = milestoneModel => async milestoneId => {
  const deleted = await milestoneModel.destroy(milestoneId).fetch();
  return deleted;
};

const getMilestonesByProject = milestoneModel => async projectId => {
  const milestones = await milestoneModel
    .find({ project: projectId })
    .sort('id ASC');
  return milestones;
};

const updateMilestoneStatus = milestoneModel => async (milestoneId, status) =>
  milestoneModel.update(milestoneId).set({ status });

const getAllMilestones = milestoneModel => async () => {
  const milestones = await milestoneModel
    .find()
    .populate('status')
    .populate('project')
    .populate('budgetStatus')
    .sort('id DESC');

  return milestones || [];
};

const updateBudgetStatus = milestoneModel => async (
  milestoneId,
  budgetStatusId
) => {
  const milestone = await milestoneModel
    .updateOne({ id: milestoneId })
    .set({ budgetStatus: budgetStatusId });

  return milestone;
};

const updateBlockchainStatus = milestoneModel => async (
  milestoneId,
  blockchainStatus
) => milestoneModel.updateOne({ id: milestoneId }).set({ blockchainStatus });

const updateCreationTransactionHash = milestoneModel => async (
  milestoneId,
  transactionHash
) => milestoneModel.updateOne({ id: milestoneId }).set({ transactionHash });

module.exports = milestoneModel => ({
  getMilestoneById: getMilestoneById(milestoneModel),
  saveMilestone: saveMilestone(milestoneModel),
  getMilestoneActivities: getMilestoneActivities(milestoneModel),
  deleteMilestone: deleteMilestone(milestoneModel),
  updateMilestone: updateMilestone(milestoneModel),
  getMilestonesByProject: getMilestonesByProject(milestoneModel),
  getAllMilestones: getAllMilestones(milestoneModel),
  updateBudgetStatus: updateBudgetStatus(milestoneModel),
  updateMilestoneStatus: updateMilestoneStatus(milestoneModel),
  updateBlockchainStatus: updateBlockchainStatus(milestoneModel),
  updateCreationTransactionHash: updateCreationTransactionHash(milestoneModel),
  getMilestoneByIdWithProject: getMilestoneByIdWithProject(milestoneModel)
});
