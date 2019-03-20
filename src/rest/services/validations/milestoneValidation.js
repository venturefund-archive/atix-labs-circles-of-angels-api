const { addError, fieldEmptyValidation } = require('./validationsUtilities');

const milestoneValidation = milestoneDto => {
  for (const key in milestoneDto) {
    fieldEmptyValidation(milestoneDto, key);
  }
  quarterValidartion(milestoneDto);
};

const quarterValidartion = dto => {
  const numbersInString = dto.quarter.match(/\d+/);
  if (numbersInString && numbersInString.length !== 1)
    addError(dto, 'Quarter must have a number');
  else if (
    numbersInString &&
    (numbersInString[0] < 1 || numbersInString[0] > 4)
  )
    addError(dto, 'Quarter is out of valid range');
};

module.exports = milestoneValidation;
