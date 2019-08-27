/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const projectDao = require('../../dao/projectDao');

const {
  fieldEmptyValidation,
  dateFormatValidation,
  addError
} = require('./validationsUtilities');

const projectValidation = projectDto => {
  fieldEmptyValidation(projectDto, 'projectName');
  fieldEmptyValidation(projectDto, 'mission');
  fieldEmptyValidation(projectDto, 'problemAddressed');
  fieldEmptyValidation(projectDto, 'location');
  fieldEmptyValidation(projectDto, 'timeframe');

  dateFormatValidation(projectDto, 'timeframe');
  nameAvailabilityValidation(projectDto, projectDao);

  return projectDto;
};

const nameAvailabilityValidation = (dto, dao) => {
  try {
    dao.availableName(dto.projectName);
  } catch (error) {
    addError(dto, error);
  }
};

module.exports = projectValidation;
