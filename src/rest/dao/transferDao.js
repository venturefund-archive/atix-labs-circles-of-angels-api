/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const TransferDao = ({ transferModel, transferStatusModel }) => ({
  async createOrUpdateTransfer({
    transferId,
    amount,
    currency,
    senderId,
    projectId,
    destinationAccount
  }) {
    const transfer = await transferModel.findOne({
      and: [
        {
          sender: senderId,
          project: projectId
        }
      ]
    });
    if (!transfer) {
      return transferModel.create({
        transferId,
        amount,
        currency,
        sender: senderId,
        project: projectId,
        destinationAccount
      });
    }
    return transferModel.update(
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

  async updateTransferState({ transferId, state }) {
    return transferModel.update({ transferId }).set({ state });
  },

  async getTransferById({ transferId }) {
    return transferModel.findTransferById(transferId);
  },

  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await transferModel.findOne({
      and: [
        {
          sender: senderId,
          project: projectId
        }
      ]
    });

    return transfer
      ? transferStatusModel.findOne({ status: transfer.state })
      : null;
  },

  async getTransferByProjectId({ projectId }) {
    return transferModel.find({ project: projectId });
  },

  async getTransfersByProjectAndState(projectId, state) {
    const transferStatus = await transferStatusModel.findOne({
      status: state
    });

    if (transferStatus) {
      const transfers = await transferModel.find({
        and: [{ project: projectId, state: transferStatus.status }]
      });
      return transfers;
    }
    return transferStatus;
  }
});

module.exports = TransferDao;
