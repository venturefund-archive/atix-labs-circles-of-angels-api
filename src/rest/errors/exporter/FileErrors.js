module.exports = {
  ImgFileTyPeNotValid: {
    message: 'The image file type is not a valid one',
    statusCode: 400
  },
  MilestoneFileTypeNotValid: {
    message: 'The milestone file type is not a valid one',
    statusCode: 400
  },
  ImgSizeBiggerThanAllowed: {
    message: 'The image size is bigger than allowed',
    statusCode: 400
  },
  MilestoneTemplateNotExist: {
    message: "Milestone template doesn't exist",
    statusCode: 500
  },
  ErrorReadingMilestoneTemplate: {
    message: 'Error reading milestones template file',
    statusCode: 500
  }
};
