module.exports = {
  RequiredParamsMissing: method => ({
    message: `Required params are missing for method ${method}`,
    statusCode: 400
  }),
  CantFindModelWithId: (model, id) => ({
    message: `Cant find ${model} with id ${id}`,
    statusCode: 400
  }),
  ErrorGetting: model => ({
    message: `Error getting ${model}`,
    statusCode: 500
  })
};