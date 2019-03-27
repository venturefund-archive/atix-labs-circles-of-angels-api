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

module.exports = milestoneModel => ({
  saveMilestone: saveMilestone(milestoneModel),
  getMilestoneActivities: getMilestoneActivities(milestoneModel)
});
