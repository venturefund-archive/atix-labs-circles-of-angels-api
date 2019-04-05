const saveMilestone = milestoneModel => async ({ milestone, projectId }) => {
  const toSave = {
    ...milestone,
    project: projectId
  };
  const createdMilestone = await milestoneModel.create(toSave);
  return createdMilestone;
};

const updateMilestone = milestoneModel => async (milestone, milestoneId) => {
  const toUpdate = { ...milestone };

  delete toUpdate.id;
  delete toUpdate.project;

  const savedMilestone = await milestoneModel
    .updateOne({ id: milestoneId })
    .set({ ...toUpdate });

  return savedMilestone;
};

const getMilestoneActivities = milestoneModel => async milestoneId => {
  const milestone = milestoneModel
    .findOne({ id: milestoneId })
    .populate('activities');

  return milestone || [];
};

module.exports = milestoneModel => ({
  saveMilestone: saveMilestone(milestoneModel),
  updateMilestone: updateMilestone(milestoneModel),
  getMilestoneActivities: getMilestoneActivities(milestoneModel)
});
