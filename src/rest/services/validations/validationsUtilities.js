/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const addError = (dto, error) => {
  const message = `Row ${dto.row} - ${error}`;
  if (!Array.isArray(dto.errors)) dto.errors = [];
  dto.errors.push(message);
};

exports.fieldEmptyValidation = (dto, field) => {
  // Check if field is not empty
  if (!/\S/.test(dto[field])) {
    const error = `The field ${field} cant be empty`;
    addError(dto, error);
  }
};

exports.dateFormatValidation = (dto, field) => {
  const timeframe = new Date(dto[field]);
  if (!timeframe.getDate()) {
    const error = `The field ${field} has incorrect format`;
    addError(dto, error);
  }
};

exports.addError = addError;
