const savePhoto = photoModel => async path => {
  const createdPhoto = await photoModel.create({ path });
  return createdPhoto;
};

const getPhotoById = photoModel => async id => {
  const photo = await photoModel.findOne({ id });
  return photo;
};

const updatePhoto = photoModel => async (photoId, path) => {
  const photo = await photoModel.updateOne({ id: photoId }).set({ path });
  return photo;
};

module.exports = photoModel => ({
  savePhoto: savePhoto(photoModel),
  getPhotoById: getPhotoById(photoModel),
  updatePhoto: updatePhoto(photoModel)
});
