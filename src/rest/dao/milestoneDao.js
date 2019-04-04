const saveMilestone = milestoneModel => async ({ milestone, projectId }) => {
  const toSave = {
    ...milestone,
    project: projectId
  };
  const createdMilestone = await milestoneModel.create(toSave);
  return createdMilestone;
};

const getMilestoneActivities = milestoneModel => async milestoneId => {
  const milestone = milestoneModel
    .findOne({ id: milestoneId })
    .populate('activities');

  return milestone || [];
};

const deleteMilestone = milestoneModel => async milestoneId => {
  const deleted = milestoneModel.destroy(milestoneId).fetch();
  return deleted;
};

module.exports = milestoneModel => ({
  saveMilestone: saveMilestone(milestoneModel),
  getMilestoneActivities: getMilestoneActivities(milestoneModel),
  deleteMilestone: deleteMilestone(milestoneModel)
});
