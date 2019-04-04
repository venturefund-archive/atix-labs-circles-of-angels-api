const saveActivity = activityModel => async ({ activity, milestoneId }) => {
  const toSave = {
    ...activity,
    milestone: milestoneId
  };
  const createdActivity = await activityModel.create(toSave);
  return createdActivity;
};

const deleteActivity = activityModel => async activityId => {
  const deleted = activityModel.destroy(activityId).fetch();
  return deleted;
};

module.exports = activityModel => ({
  saveActivity: saveActivity(activityModel),
  deleteActivity: deleteActivity(activityModel)
});
