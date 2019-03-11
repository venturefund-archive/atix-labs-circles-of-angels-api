const { fieldEmptyValidation } = require('./validationsUtilities');

exports.projectValidation = projectDto => {

  fieldEmptyValidation(projectDto, 'projectName');
  fieldEmptyValidation(projectDto, 'mission');
  fieldEmptyValidation(projectDto, 'problemAddressed');
  fieldEmptyValidation(projectDto, 'location');
  fieldEmptyValidation(projectDto, 'timeframe');

  return projectDto;
};

exports.milestoneValidation = milestonDto => {

}
