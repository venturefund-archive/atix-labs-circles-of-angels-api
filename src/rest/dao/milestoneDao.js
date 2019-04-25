const getMilestoneById = milestoneModel => async milestoneId => {
  const milestone = await milestoneModel.findOne({ id: milestoneId });
  return milestone;
};

const saveMilestone = milestoneModel => async ({ milestone, projectId }) => {
  const toSave = {
    ...milestone,
    project: projectId,
    status: 1
  };
  const createdMilestone = await milestoneModel.create(toSave);
  return createdMilestone;
};

const updateMilestone = milestoneModel => async (milestone, milestoneId) => {
  const toUpdate = { ...milestone };

  delete toUpdate.id;
  delete toUpdate.project;
  toUpdate.status = toUpdate.status || 1;

  const savedMilestone = await milestoneModel
    .updateOne({ id: milestoneId })
    .set({ ...toUpdate });

  return savedMilestone;
};

const getMilestoneActivities = milestoneModel => async milestoneId => {
  const milestone = milestoneModel
    .findOne({ id: milestoneId })
    .populate('activities')
    .populate('status');

  return milestone || [];
};

const deleteMilestone = milestoneModel => async milestoneId => {
  const deleted = milestoneModel.destroy(milestoneId).fetch();
  return deleted;
};

const getMilestonesByProject = milestoneModel => async projectId => {
  const milestones = milestoneModel.find({ project: projectId });
  return milestones;
};

const updateMilestoneStatus = milestoneModel => async (milestoneId, status) => {
  return milestoneModel.update(milestoneId).set({ status });
};

module.exports = milestoneModel => ({
  getMilestoneById: getMilestoneById(milestoneModel),
  saveMilestone: saveMilestone(milestoneModel),
  getMilestoneActivities: getMilestoneActivities(milestoneModel),
  deleteMilestone: deleteMilestone(milestoneModel),
  updateMilestone: updateMilestone(milestoneModel),
  getMilestonesByProject: getMilestonesByProject(milestoneModel),
  updateMilestoneStatus: updateMilestoneStatus(milestoneModel)
});
