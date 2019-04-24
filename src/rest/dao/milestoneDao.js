const getMilestoneById = milestoneModel => async milestoneId => {
  const milestone = await milestoneModel.findOne({ id: milestoneId });
  return milestone;
};

const saveMilestone = milestoneModel => async ({ milestone, projectId }) => {
  const toSave = {
    ...milestone,
    project: projectId,
    status: 1,
    budgetStatus: 1
  };
  const createdMilestone = await milestoneModel.create(toSave);
  return createdMilestone;
};

const updateMilestone = milestoneModel => async (milestone, milestoneId) => {
  const toUpdate = { ...milestone };

  delete toUpdate.id;
  delete toUpdate.project;
  toUpdate.status = toUpdate.status || 1;
  toUpdate.budgetStatus = toUpdate.budgetStatus || 1;

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

const getAllMilestones = milestoneModel => async () => {
  const milestones = await milestoneModel
    .find()
    .populate('status')
    .populate('project')
    .populate('budgetStatus')
    .sort('createdAt DESC');

  return milestones || [];
};

module.exports = milestoneModel => ({
  getMilestoneById: getMilestoneById(milestoneModel),
  saveMilestone: saveMilestone(milestoneModel),
  getMilestoneActivities: getMilestoneActivities(milestoneModel),
  deleteMilestone: deleteMilestone(milestoneModel),
  updateMilestone: updateMilestone(milestoneModel),
  getMilestonesByProject: getMilestonesByProject(milestoneModel),
  getAllMilestones: getAllMilestones(milestoneModel)
});
