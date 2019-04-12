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
  toUpdate.status = 1;

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

module.exports = milestoneModel => ({
  saveMilestone: saveMilestone(milestoneModel),
  getMilestoneActivities: getMilestoneActivities(milestoneModel),
  deleteMilestone: deleteMilestone(milestoneModel),
  updateMilestone: updateMilestone(milestoneModel)
});
