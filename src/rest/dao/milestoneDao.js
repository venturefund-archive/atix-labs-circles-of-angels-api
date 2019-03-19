const saveMilestone = milestoneModel => async ({ milestone, projectId }) => {
  const toSave = {
    ...milestone,
    project: projectId
  };
  const createdMilestone = await milestoneModel.create(toSave);
  return createdMilestone;
};

module.exports = milestoneModel => ({
  saveMilestone: saveMilestone(milestoneModel)
});
