const saveActivityFile = activityFileModel => async (activityId, fileId) => {
  const activityFile = await activityFileModel.create({
    activity: activityId,
    file: fileId
  });
  return activityFile;
};

const getActivityFileByActivityAndFile = activityFileModel => async (activityId, fileId) => {
  const activityFile = await activityFileModel.findOne({
    activity: activityId,
    file: fileId
  });
  return activityFile;
};

const getActivityFileByActivity = activityFileModel => async activityId => {
  const activityFiles = await activityFileModel.find({
    activity: activityId
  });
  return activityFiles;
};

const deleteActivityFile = activityFileModel => async activityFileId => {
  const deleted = activityFileModel.destroy(activityFileId).fetch();
  return deleted;
};

module.exports = activityFileModel => ({
  saveActivityFile: saveActivityFile(activityFileModel),
  deleteActivityFile: deleteActivityFile(activityFileModel),
  getActivityFileByActivityAndFile: getActivityFileByActivityAndFile(
    activityFileModel
  ),
  getActivityFileByActivity: getActivityFileByActivity(activityFileModel)
});
