const TransferDao = () => {
  return {
    transferModel: require("../server").fastify.models.fund_transfer,
    transferStatusModel: require("../server").fastify.models.transfer_status,
    sendTransferToVerification: async function({
      transferId,
      amount,
      currency,
      senderId,
      projectId,
      destinationAccount
    }) {
      let transfer = await this.transferModel.findTransferById(transferId);
      if (!transfer)
        await this.transferModel.create({
          transferId: transferId,
          amount: amount,
          currency: currency,
          senderId: senderId,
          projectId: projectId,
          destinationAccount: destinationAccount
        });
      else
        await this.transferModel.update(
          { transferId: transferId },
          {
            transferId: transferId,
            amount: amount,
            currency: currency,
            projectId: projectId
          }
        );
    },

    updateTransferState: async function({ transferId, state }) {
      return this.transferModel.updateTransferState({ transferId, state });
    },

    getTransferById: async function({transferId}) {
      return this.transferModel.findTransferById(transferId);
    },
    getTransferStatusById: async function({transferId}) {
      const transfer = await this.transferModel.findTransferById(transferId);
      return this.transferStatusModel.findOne({status: transfer.state});
    }
  };
};



module.exports = TransferDao;
