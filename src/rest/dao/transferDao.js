
const TransferDao = () => {
  return {
    transferModel: require("../server").fastify.models.fund_transfer,

    sendTransferToVerification: async function({
      transferId,
      amount,
      currency,
      senderId,
      projectId,
      receiverId
    }) {
      let transfer = await this.transferModel.findTransferById(transferId);
      if (!transfer)
        await this.transferModel.create({
          transferId: request.body.transferId,
          amount: amount,
          currency: currency,
          senderId: senderId,
          projectId: projectId,
          receiverId: receiverId
        });
      else
        await this.transferModel.update(
          { transferId: transferId },
          {
            transferId: request.body.transferId,
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
    }
  };
};



module.exports = TransferDao;
