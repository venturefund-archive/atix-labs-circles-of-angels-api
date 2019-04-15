const { transferStatus } = require('../../rest/util/constants');

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
  },

  /**
   * Finds all verified funds for a project and returns the total amount
   *
   * @param {number} projectId
   * @returns total funded amount || error
   */
  async getTotalFundedByProject(projectId) {
    fastify.log.info(
      '[Transfer Service] :: Getting total transfers amount for Project ID',
      projectId
    );
    try {
      const transfers = await transferDao.getTransfersByProjectAndState(
        projectId,
        transferStatus.VERIFIED
      );

      // project doesn't have any transfers
      if (!transfers || transfers.length === 0) {
        fastify.log.info(
          `[Transfer Service] :: Project ID ${projectId} does not have any funds transferred`
        );
        return 0;
      }

      // sum transfers amount
      const totalAmount = transfers.reduce(
        (total, transfer) => total + transfer.amount,
        0
      );

      fastify.log.info(
        `[Transfer Service] :: Project ID ${projectId} total funds: ${totalAmount}`
      );

      return totalAmount;
    } catch (error) {
      fastify.log.error(
        '[Transfer Service] :: Error getting transfers:',
        error
      );
      throw Error('Error getting transfers');
    }
  }
});

module.exports = transferService;
