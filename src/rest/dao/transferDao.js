/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txFunderStatus } = require('../util/constants');

module.exports = {
  async createOrUpdateTransfer({
    transferId,
    amount,
    currency,
    senderId,
    projectId,
    destinationAccount
  }) {
    const transfer = await this.model.findOne({
      and: [
        {
          sender: senderId,
          project: projectId
        }
      ]
    });
    if (!transfer) {
      return this.model.create({
        transferId,
        amount,
        currency,
        sender: senderId,
        project: projectId,
        destinationAccount
      });
    }
    return this.model.update(
      { sender: senderId, project: projectId },
      {
        transferId,
        amount,
        currency,
        state: 0,
        destinationAccount
      }
    );
  },

  async create({
    transferId,
    senderId,
    destinationAccount,
    amount,
    currency,
    projectId,
    receiptPath,
    status
  }) {
    return this.model.create({
      transferId,
      amount,
      currency,
      sender: senderId,
      project: projectId,
      destinationAccount,
      receiptPath,
      status
    });
  },

  async updateTransferState({ transferId, state }) {
    return this.model.update({ id: transferId }).set({ state });
  },

  async getTransferById({ transferId }) {
    return this.model.findOne({ transferId });
  },

  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await this.model.findOne({
      and: [
        {
          sender: senderId,
          project: projectId
        }
      ]
    });

    return transfer ? transfer.status : undefined;
  },

  async getTransferByProjectId({ projectId }) {
    return this.model.find({ project: projectId });
  },

  async getTransfersByProjectAndState(projectId, status) {
    if (Object.values(txFunderStatus).includes(status)) {
      const transfers = await this.model.find({
        and: [{ project: projectId, status }]
      });
      return transfers;
    }
  }
};
