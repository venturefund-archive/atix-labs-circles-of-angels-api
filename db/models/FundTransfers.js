module.exports = {
  identity: "fund_transfer",
  primaryKey: "id",
  attributes: {
    transferId: { type: "string", required: true },
    senderId: { type: "string", required: true },
    destinationAccount: { type: "string", required: true },
    amount: { type: "number", required: true },
    currency: { type: "string", required: true },
    projectId: { type: "number", required: true },
    state: { type: "number", defaultsTo: 0 },
    createdAt: { type: "string", autoCreatedAt: true },
    updatedAt: { type: "string", autoUpdatedAt: true },
    id: { type: "number", autoMigrations: { autoIncrement: true }}
  },
  // findTransferById: async function(transferId) {
  //   console.log(transferId)
  //   return this.findOne(transferId);
  // },
  createOrUpdateTransfer: async function({
    transferId,
    senderId,
    destinationAccount,
    projectId,
    amount,
    currency
  }) {
    this.findOrCreate(transferId, {
      transferId,
      senderId,
      destinationAccount,
      projectId,
      amount,
      currency,
      id: this.count()
    });
  },
  updateTransferState: async function({
    transferId,
    state
  }) {
    return this.update({transferId: transferId}).set({state: state});
  },
  findTransferByUserAndProject: async function({senderId, projectId}) {
    return this.findOne({senderId: senderId, projectId: projectId});
  }
};
