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
  }),
  UserNotAuthorized: userId => ({
    message: `User ${userId} not authorized for this action`,
    statusCode: 401
  }),
  InvalidStatus: (model, status) => ({
    message: `Can't make this action when the ${model} in ${status} status`,
    statusCode: 400
  })
};
