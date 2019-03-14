/**
 * @description Represents a bank transfer register  
 * 
 * @attribute transferId: Bank transfer recipt
 * @attribute senderId: id del usuario que envia
 * @attribute destinationAccount: id del usuario que recibe
 * @attribute projectId: el id del proyecto al cual pertenece esta transferencia bancaria
 * @attribute amount: cantidad de dinero transferida
 * @attribute currency: moneda en la cual se realizó la transferencia
 */
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
    id: { type: "number", autoMigrations: { autoIncrement: true } }
  },
  // findTransferById: async function(transferId) {
  //   console.log(transferId)
  //   return this.findOne(transferId);
  // },
  updateTransferState: async function({ transferId, state }) {
    return this.update({ transferId: transferId }).set({ state: state });
  },
  findTransferByUserAndProject: async function({ senderId, projectId }) {
    const transfer = await this.findOne({
      and: [{ senderId: senderId }, { projectId: projectId }]
    });
    return transfer;
  }
};
