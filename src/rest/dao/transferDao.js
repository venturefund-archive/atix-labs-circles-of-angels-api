const TransferDao = () => {
  return {
    transferModel: require("../server").fastify.models.fund_transfer,

    sendTransferToVerification: async function({
      transferId,
      amount,
      currency,
      senderId,
      projectId,
      destinationAccount
    }) {
      const transfer = await this.transferModel.findTransferById(transferId);
      if (!transfer)
        return this.transferModel.create({
          transferId: transferId,
          amount: amount,
          currency: currency,
          senderId: senderId,
          projectId: projectId,
          destinationAccount: destinationAccount
        });
      else
        return this.transferModel.update(transferId, {
          transferId: transferId,
          amount: amount,
          currency: currency,
          projectId: projectId,
          state: 0,
          destinationAccount: destinationAccount
        });
    },

    updateTransferState: async function({ transferId, state }) {
      return this.transferModel.updateTransferState({ transferId, state });
    }
  };
};

module.exports = TransferDao;
