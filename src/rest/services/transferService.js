/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { transferStatus } = require('../util/constants');

const logger = {
  log: () => {},
  error: () => {},
  info: () => {}
};

module.exports = {
  async sendTransferToVerification({
    transferId,
    amount,
    currency,
    senderId,
    projectId,
    destinationAccount
  }) {
    return this.transferDao.createOrUpdateTransfer({
      transferId,
      amount,
      currency,
      senderId,
      projectId,
      destinationAccount
    });
  },

  async updateTransferState({ transferId, state }) {
    return this.transferDao.updateTransferState({ transferId, state });
  },

  async getTransferById({ transferId }) {
    return this.transferDao.findTransferById(transferId);
  },

  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await this.transferDao.getTransferStatusByUserAndProject({
      senderId,
      projectId
    });
    return transfer;
  },

  async getTransferList({ projectId }) {
    return this.transferDao.getTransferByProjectId({ projectId });
  },

  /**
   * Finds all verified funds for a project and returns the total amount
   *
   * @param {number} projectId
   * @returns total funded amount || error
   */
  async getTotalFundedByProject(projectId) {
    logger.info(
      '[Transfer Service] :: Getting total transfers amount for Project ID',
      projectId
    );
    try {
      const transfers = await this.transferDao.getTransfersByProjectAndState(
        projectId,
        transferStatus.VERIFIED
      );

      // project doesn't have any transfers
      if (!transfers || transfers.length === 0) {
        logger.info(
          `[Transfer Service] :: Project ID ${projectId} does not have any funds transferred`
        );
        return 0;
      }

      // sum transfers amount
      const totalAmount = transfers.reduce(
        (total, transfer) => total + transfer.amount,
        0
      );

      logger.info(
        `[Transfer Service] :: Project ID ${projectId} total funds: ${totalAmount}`
      );

      return totalAmount;
    } catch (error) {
      logger.error('[Transfer Service] :: Error getting transfers:', error);
      throw Error('Error getting transfers');
    }
  }
};
