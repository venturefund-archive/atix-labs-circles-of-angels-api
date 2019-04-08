const saveActivity = activityModel => async (activity, milestoneId) => {
  const toSave = {
    ...activity,
    milestone: milestoneId
  };
  const createdActivity = await activityModel.create(toSave);
  return createdActivity;
};

const updateActivity = activityModel => async (activity, activityId) => {
  const toUpdate = { ...activity };

  delete toUpdate.id;
  delete toUpdate.milestone;

  const savedActivity = await activityModel
    .updateOne({ id: activityId })
    .set({ ...toUpdate });

  return savedActivity;
};

const deleteActivity = activityModel => async activityId => {
  const deleted = activityModel.destroy(activityId).fetch();
  return deleted;
};

module.exports = activityModel => ({
  saveActivity: saveActivity(activityModel),
  deleteActivity: deleteActivity(activityModel),
  updateActivity: updateActivity(activityModel)
});
