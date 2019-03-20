const TransferDao = ({ transferModel, transferStatusModel }) => ({
  async createOrUpdateTransfer({
    transferId,
    amount,
    currency,
    senderId,
    projectId,
    destinationAccount
  }) {
    const transfer = await transferModel.findTransferByUserAndProject({
      senderId,
      projectId
    });
    if (!transfer) {
      return transferModel.create({
        transferId,
        amount,
        currency,
        senderId,
        projectId,
        destinationAccount
      });
    }
    return transferModel.update(
      { senderId, projectId },
      {
        transferId,
        amount,
        currency,
        projectId,
        state: 0,
        destinationAccount
      }
    );
  },

  async updateTransferState({ transferId, state }) {
    return transferModel.updateTransferState({ transferId, state });
  },

  async getTransferById({ transferId }) {
    return transferModel.findTransferById(transferId);
  },
  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await transferModel.findTransferByUserAndProject({
      senderId,
      projectId
    });
    return transfer
      ? transferStatusModel.findOne({ status: transfer.state })
      : null;
  },
  async getTransferByProjectId({ projectId }) {
    return transferModel.find({ projectId });
  }
});

module.exports = TransferDao;
