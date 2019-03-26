const transferService = ({ fastify, transferDao }) => ({
  async sendTransferToVerification({
    transferId,
    amount,
    currency,
    senderId,
    projectId,
    destinationAccount
  }) {
    return transferDao.createOrUpdateTransfer({
      transferId,
      amount,
      currency,
      senderId,
      projectId,
      destinationAccount
    });
  },

  async updateTransferState({ transferId, state }) {
    return transferDao.updateTransferState({ transferId, state });
  },

  async getTransferById({ transferId }) {
    return transferDao.findTransferById(transferId);
  },

  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await transferDao.getTransferStatusByUserAndProject({
      senderId,
      projectId
    });
    return transfer;
  },

  async getTransferList({ projectId }) {
    return transferDao.getTransferByProjectId({ projectId });
  }
});

module.exports = transferService;
