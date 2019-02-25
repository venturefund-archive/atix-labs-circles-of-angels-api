module.exports = {
  identity: "fund_transfer",
  primaryKey: "transferId",
  attributes: {
    transferId: { type: "string", required: true },
    senderId: { type: "string", required: true },
    receiverId: { type: "string", required: true },
    amount: { type: "number", required: true },
    currency: { type: "string", required: true },
    projectId: { type: "number", required: true },
    state: { type: "number", defaultsTo: 0 },
    createdAt: { type: "string", autoCreatedAt: true },
    updatedAt: { type: "string", autoUpdatedAt: true },
    id: { type: "number", autoMigrations: { autoIncrement: true } }
  },
  findTransferById: async function(transferId) {
    console.log(transferId)
    return this.findOne(transferId);
  },
  createOrUpdateTransfer: async function({
    transferId,
    senderId,
    receiverId,
    projectId,
    amount,
    currency
  }) {
    this.findOrCreate(transferId, {
      transferId,
      senderId,
      receiverId,
      projectId,
      amount,
      currency
    });
  },
  updateTransferState: async function({
    transferId,
    state
  }) {
    return this.update({transferId: transferId}).set({state: state});
  }
};
