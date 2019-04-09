const saveActivityPhoto = activityPhotoModel => async (activityId, photoId) => {
  const activityPhoto = await activityPhotoModel.create({
    activity: activityId,
    photo: photoId
  });
  return activityPhoto;
};

const getActivityPhotoByActivityAndPhoto = activityPhotoModel => async (activityId, photoId) => {
  const activityPhoto = await activityPhotoModel.findOne({
    activity: activityId,
    photo: photoId
  });
  return activityPhoto;
};

const deleteActivityPhoto = activityPhotoModel => async activityPhotoId => {
  const deleted = activityPhotoModel.destroy(activityPhotoId).fetch();
  return deleted;
};

module.exports = activityPhotoModel => ({
  saveActivityPhoto: saveActivityPhoto(activityPhotoModel),
  deleteActivityPhoto: deleteActivityPhoto(activityPhotoModel),
  getActivityPhotoByActivityAndPhoto: getActivityPhotoByActivityAndPhoto(
    activityPhotoModel
  )
});
