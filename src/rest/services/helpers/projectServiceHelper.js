const mime = require('mime');
const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const MAX_PHOTO_SIZE = 500000;

const validateExistence = (dao, id, model) => {
  try {
    return dao.findById(id);
  } catch (error) {
    throw new COAError(`Cant find ${model} with id ${id}`);
  }
};

const validateParams = (...params) => {
  if (!params.reduce((prev, current) => prev && current, true))
    throw new COAError(errors.CreateProjectFieldsNotValid);
};

const imgValidator = file => {
  const fileType = mime.lookup(file.name);
  if (!fileType.includes('image/'))
    throw new COAError(errors.ImgFileTyPeNotValid);
};

const xslValidator = file => {
  const fileType = mime.lookup(file.name);
  if (
    !(
      fileType === 'application/vnd.ms-excel' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  )
    throw new COAError(errors.MilestoneFileTypeNotValid);
};

const mtypesValidator = {
  coverPhoto: imgValidator,
  thumbnail: imgValidator,
  milestones: xslValidator
};

const validateMtype = type => file => mtypesValidator[type](file);

const validatePhotoSize = file => {
  if (file.size > MAX_PHOTO_SIZE) {
    throw new COAError(errors.ImgSizeBiggerThanAllowed);
  }
};

module.exports = {
  validateExistence,
  validateParams,
  validateMtype,
  validatePhotoSize,
  xslValidator,
  imgValidator
};
