const {
  fieldEmptyValidation,
  dateFormatValidation,
  addError
} = require("./validationsUtilities");

exports.projectValidation = (projectDto, projectDao) => {
  fieldEmptyValidation(projectDto, "projectName");
  fieldEmptyValidation(projectDto, "mission");
  fieldEmptyValidation(projectDto, "problemAddressed");
  fieldEmptyValidation(projectDto, "location");
  fieldEmptyValidation(projectDto, "timeframe");

  dateFormatValidation(projectDto, "timeframe");

  nameAvailabilityValidation(projectDto,projectDao);

  return projectDto;
};

const nameAvailabilityValidation = (dto, dao) => {
  try {
    dao.availableName(dto.projectName);
  } catch (error) {
    addError(dto, error);
  }
}