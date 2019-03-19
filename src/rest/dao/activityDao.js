const saveActivity = activityModel => async ({ activity, milestoneId }) => {
  const toSave = {
    ...activity,
    milestone: milestoneId
  };
  const createdActivity = await activityModel.create(toSave);
  return createdActivity;
};

module.exports = activityModel => ({
  saveActivity: saveActivity(activityModel)
});
