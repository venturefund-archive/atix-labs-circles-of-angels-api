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
  identity: 'fund_transfer',
  primaryKey: 'id',
  attributes: {
    transferId: { type: 'string', required: true },
    sender: {
      columnName: 'senderId',
      model: 'user'
    },
    destinationAccount: { type: 'string', required: true },
    amount: { type: 'number', required: true },
    currency: { type: 'string', required: true },
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    state: { type: 'number', defaultsTo: 0 },
    createdAt: { type: 'string', autoCreatedAt: true },
    updatedAt: { type: 'string', autoUpdatedAt: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  },
  // findTransferById: async function(transferId) {
  //   console.log(transferId)
  //   return this.findOne(transferId);
  // },
  // async updateTransferState({ transferId, state }) {
  //   return this.update({ transferId }).set({ state });
  // }
  // async findTransferByUserAndProject({ sender, project }) {
  //   const transfer = await this.findOne({
  //     and: [{ sender }, { project }]
  // }
};
