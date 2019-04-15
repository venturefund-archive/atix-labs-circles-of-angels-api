const saveActivityPhoto = activityPhotoModel => async (activityId, photoId) => {
  const activityPhoto = await activityPhotoModel.create({
    activity: activityId,
    photo: photoId
  });
  return activityPhoto;
};

const getActivityPhotoByActivityAndPhoto = activityPhotoModel => async (
  activityId,
  photoId
) => {
  const activityPhoto = await activityPhotoModel.findOne({
    activity: activityId,
    photo: photoId
  });
  return activityPhoto;
};

const getActivityPhotoByActivity = activityPhotoModel => async activityId => {
  const activityPhotos = await activityPhotoModel
    .find({
      activity: activityId
    })
    .populate('photo');
  return activityPhotos;
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
  ),
  getActivityPhotoByActivity: getActivityPhotoByActivity(activityPhotoModel)
});
