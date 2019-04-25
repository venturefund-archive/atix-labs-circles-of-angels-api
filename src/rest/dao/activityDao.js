const saveActivity = activityModel => async (activity, milestoneId) => {
  const toSave = {
    ...activity,
    milestone: milestoneId,
    status: 1
  };
  const createdActivity = await activityModel.create(toSave);
  return createdActivity;
};

const getActivityById = activityModel => async activityId => {
  const activity = await activityModel.findOne({ id: activityId });
  return activity;
};

const updateActivity = activityModel => async (activity, activityId) => {
  const toUpdate = { ...activity };

  delete toUpdate.id;
  delete toUpdate.milestone;
  toUpdate.status = toUpdate.status || 1;

  const savedActivity = await activityModel
    .updateOne({ id: activityId })
    .set({ ...toUpdate });

  return savedActivity;
};

const deleteActivity = activityModel => async activityId => {
  const deleted = activityModel.destroy(activityId).fetch();
  return deleted;
};

const updateStatus = activityModel => async (activityId, status) => {
  return activityModel.update(activityId).set({ status });
};
const updateStatusWithTransaction = activityModel => async (
  activityId,
  status,
  transactionHash
) => {
  return activityModel.update(activityId).set({ status, transactionHash });
};

module.exports = activityModel => ({
  saveActivity: saveActivity(activityModel),
  updateActivity: updateActivity(activityModel),
  getActivityById: getActivityById(activityModel),
  deleteActivity: deleteActivity(activityModel),
  updateStatus: updateStatus(activityModel),
  updateStatusWithTransaction: updateStatusWithTransaction(activityModel)
});
