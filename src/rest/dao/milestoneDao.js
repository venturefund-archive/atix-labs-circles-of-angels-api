const { activityStatus, milestoneBudgetStatus } = require('../util/constants');

const getMilestoneById = milestoneModel => async milestoneId => {
  const milestone = await milestoneModel.findOne({ id: milestoneId });
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
    budgetStatus: budgetStatus ? budgetStatus : milestoneBudgetStatus.BLOCKED
    blockchainStatus: 1
  };
  const createdMilestone = await milestoneModel.create(toSave);
  return createdMilestone;
};

const updateMilestone = milestoneModel => async (milestone, milestoneId) => {
  const toUpdate = { ...milestone };

  delete toUpdate.id;
  delete toUpdate.project;

  toUpdate.status = toUpdate.status || activityStatus.PENDING;
  toUpdate.budgetStatus = toUpdate.budgetStatus || milestoneBudgetStatus.BLOCKED;
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
  const milestones = await milestoneModel.find({ project: projectId });
  return milestones;
};

const updateMilestoneStatus = milestoneModel => async (milestoneId, status) => {
  return milestoneModel.update(milestoneId).set({ status });
};

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
) => {
  return milestoneModel
    .updateOne({ id: milestoneId })
    .set({ blockchainStatus });
};

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
  updateBlockchainStatus: updateBlockchainStatus(milestoneModel)
});
