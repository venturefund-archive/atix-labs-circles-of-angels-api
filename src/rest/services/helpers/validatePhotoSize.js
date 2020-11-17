const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

const MAX_PHOTO_SIZE = 500000;

/**
 * Validates that the file size is not larger than the max allowed
 * @param {File} file - File to validate its size
 */
module.exports = file => {
  logger.info('[ValidatePhotoSize] :: Entering validatePhotoSize method');
  if (file.size > MAX_PHOTO_SIZE) {
    logger.error(
      '[ValidatePhotoSize] :: File size is bigger than the size allowed'
    );
    throw new COAError(errors.file.ImgSizeBiggerThanAllowed);
  }
};
