const saveFile = fileModel => async path => {
  const savedFile = await fileModel.create({
    path
  });
  return savedFile;
};

const deleteFile = fileModel => async fileId => {
  const deletedFile = await fileModel.destroyOne({ id: fileId });
  return deletedFile;
};

module.exports = fileModel => ({
  saveFile: saveFile(fileModel),
  deleteFile: deleteFile(fileModel)
});
