/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const transferService = require('../../services/transferService');

module.exports = {
  createTransfer: () => async (request, reply) => {
    const {
      transferId,
      destinationAccount,
      amount,
      currency,
      projectId
    } = request.raw.body;
    const { receiptFile } = request.raw.files;
    const senderId = request.user.id;

    const response = await transferService.createTransfer({
      transferId,
      destinationAccount,
      amount,
      currency,
      projectId,
      senderId,
      receiptFile
    });
    reply.status(200).send(response);
  },

  updateTransfer: () => async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    const response = await transferService.updateTransfer(id, { status });
    reply.status(200).send(response);
  },

  getState: () => async (request, reply) => {
    const status = await transferService.getTransferStatusByUserAndProject({
      senderId: request.params.userId,
      projectId: request.params.projectId
    });

    if (status) {
      reply.send({
        state: status
      });
    } else {
      reply.code(400).send({ error: 'No transfer receipt found' });
    }
  },

  getTransfers: () => async (request, reply) => {
    const transferList = await transferService.getTransferList({
      projectId: request.params.projectId
    });
    reply.send(transferList);
  }
};
