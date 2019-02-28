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
        const maxIdTransfer = await this.transferModel.find({
          where: {},
          select: ["id"],
          limit: 1,
          sort: "id DESC"
        });
        await this.transferModel.create({
          transferId: transferId,
          amount: amount,
          currency: currency,
          senderId: senderId,
          projectId: projectId,
          destinationAccount: destinationAccount,
          id: Number(maxIdTransfer[0].id) + 1
        });
      } else
        await this.transferModel.update(
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
    getTransferStatusById: async function({ transferId }) {
      const transfer = await this.transferModel.findTransferById(transferId);
      return this.transferStatusModel.findOne({ status: transfer.state });
    },
    getTransferList: function({ projectId }) {
      return this.transferModel.find({ projectId: projectId });
    }
  };
};

module.exports = TransferDao;
