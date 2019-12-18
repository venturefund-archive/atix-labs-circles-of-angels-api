const mime = require('mime');
const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

const imgValidator = file => {
  logger.info('[ValidateMtype] :: Entering imgValidator method');
  logger.info(`[ValidateMtype] :: Looking for fileType of file ${file.name}`);
  const fileType = mime.lookup(file.name);
  if (!fileType.includes('image/')) {
    logger.error('[ValidateMtype] :: File type is not a valid img type');
    throw new COAError(errors.ImgFileTyPeNotValid);
  }
};

const xlsValidator = file => {
  logger.info('[ValidateMtype] :: Entering xsl method');
  logger.info(`[ValidateMtype] :: Looking for fileType of file ${file.name}`);
  const fileType = mime.lookup(file.name);
  if (
    !(
      fileType === 'application/vnd.ms-excel' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  ) {
    logger.error('[ValidateMtype] :: File type is not a valid excel type');
    throw new COAError(errors.MilestoneFileTypeNotValid);
  }
};

const mtypesValidator = {
  coverPhoto: imgValidator,
  thumbnail: imgValidator,
  milestones: xlsValidator,
  experiencePhoto: imgValidator,
  transferReceipt: imgValidator
};

/**
 * Validates the type of a file is the correct one
 * @param {'coverPhoto' | 'thumbnail' | 'milestones'
 * | 'experiencePhoto' | 'transferReceipt' } type - Type of file
 * @param {File} file - File to validate
 */
module.exports = (type, file) => mtypesValidator[type](file);
