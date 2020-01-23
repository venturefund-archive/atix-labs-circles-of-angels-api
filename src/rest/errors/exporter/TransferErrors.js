module.exports = {
  ProjectCantReceiveTransfers: status => ({
    message: `Project with status ${status} can't receive transfers`,
    statusCode: 403
  }),
  TransferIdAlreadyExists: transferId => ({
    message: `There is another PENDING or VERIFIED transfer with the same transferId ${transferId}`,
    statusCode: 403
  }),
  TransferStatusNotValid: status => ({
    message: `Transfer status '${status}' is not a valid value`,
    statusCode: 403
  }),
  TransferStatusCannotChange: status => ({
    message: `A transfer of status '${status}' can't be updated`,
    statusCode: 403
  }),
  CantCreateTransfer: {
    message: "Couldn't create transfer"
  }
};