exports.fieldEmptyValidation = (dto, field) => {
  //Check if field is not empty
  if (!/\S/.test(dto[field])) {
    const error = `The field ${field} cant be empty`;
    if (!Array.isArray(dto.errors)) dto.errors = [];
    dto.errors.push(error);
  }
}
