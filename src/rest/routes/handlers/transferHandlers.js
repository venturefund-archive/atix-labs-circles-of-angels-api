/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const apiHelper = require('../../services/helper');

module.exports = {
  sendToVerification: fastify => async (request, reply) => {
    const { transferService } = apiHelper.helper.services;
    fastify.log.info('[Transfer Routes] :: Send transfer to verification');
    const verification = await transferService.sendTransferToVerification({
      transferId: request.body.transferId,
      amount: request.body.amount,
      currency: request.body.currency,
      senderId: request.body.senderId,
      projectId: request.body.projectId,
      destinationAccount: request.body.destinationAccount
    });
    if (!verification)
      reply
        .status(409)
        .send({ error: 'Error when trying upload transfer information' });
    reply.send({ sucess: 'Transfer information upload sucessfuly!' });
  },

  updateTransfer: fastify => async (request, reply) => {
    const { transferService } = apiHelper.helper.services;
    fastify.log.info('[Transfer Routes] :: Update transfer state');
    const verification = await transferService.updateTransferState({
      transferId: request.params.id,
      state: request.body.state
    });
    if (!verification)
      reply.send({ error: 'Error when trying upload transfer state' });
    reply.send({ sucess: 'Transfer information upload sucessfuly!' });
  },

  getState: fastify => async (request, reply) => {
    const { transferService } = apiHelper.helper.services;
    fastify.log.info(
      `[Transfer Routes] :: Getting state of user ${
        request.params.userId
      } in project ${request.params.projectId}`
    );
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

  getTransfers: fastify => async (request, reply) => {
    const { transferService } = apiHelper.helper.services;
    fastify.log.info(
      `[Transfer Routes] :: Getting transactions of project ${
        request.params.projectId
      }`
    );
    const transferList = await transferService.getTransferList({
      projectId: request.params.projectId
    });
    reply.send(transferList);
  }
};
