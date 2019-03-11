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
      let transfer = await this.transferModel.findTransferByUserAndProject({
        senderId,
        projectId
      });
      if (!transfer) {
        return this.transferModel.create({
          transferId: transferId,
          amount: amount,
          currency: currency,
          senderId: senderId,
          projectId: projectId,
          destinationAccount: destinationAccount
        });
      } else
        return this.transferModel.update(
          { senderId: senderId, projectId: projectId },
          {
            transferId: transferId,
            amount: amount,
            currency: currency,
            projectId: projectId,
            state: 0,
            destinationAccount: destinationAccount
          }
        );
    },

    updateTransferState: async function({ transferId, state }) {
      return this.transferModel.updateTransferState({ transferId, state });
    },

    getTransferById: async function({ transferId }) {
      return this.transferModel.findTransferById(transferId);
    },
    getTransferStatusByUserAndProject: async function({ senderId, projectId }) {
      const transfer = await this.transferModel.findTransferByUserAndProject({senderId, projectId});
      return transfer ? this.transferStatusModel.findOne({ status: transfer.state }) : null;
    },
    getTransferList: function({ projectId }) {
      return this.transferModel.find({ projectId: projectId });
    }
  };
};

module.exports = TransferDao;
