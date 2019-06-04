const apiHelper = require('../../services/helper');

const sendToVerification = fastify => async (request, reply) => {
  const { transferService } = apiHelper.helper.services;
  fastify.log.info('[Transfer Routes] :: Send transfer to verification');
  const verification = await transferService.sendTransferToVerification({
    transferId: request.params.transferId,
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
};

const updateState = fastify => async (request, reply) => {
  const { transferService } = apiHelper.helper.services;
  fastify.log.info('[Transfer Routes] :: Update transfer state');
  const verification = await transferService.updateTransferState({
    transferId: request.body.transferId,
    state: request.body.state
  });
  if (!verification)
    reply.send({ error: 'Error when trying upload transfer state' });
  reply.send({ sucess: 'Transfer information upload sucessfuly!' });
};

const getState = fastify => async (request, reply) => {
  const { transferService } = apiHelper.helper.services;
  fastify.log.info(
    `[Transfer Routes] :: Getting state of user ${
      request.params.senderId
    } in project ${request.params.projectId}`
  );
  const status = await transferService.getTransferStatusByUserAndProject({
    senderId: request.params.senderId,
    projectId: request.params.projectId
  });

  if (status) {
    reply.send({
      state: status
    });
  } else {
    reply.code(400).send({ error: 'No transfer receipt found' });
  }
};

const getTransfers = fastify => async (request, reply) => {
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
};

module.exports = fastify => ({
  sendToVerification: sendToVerification(fastify),
  updateState: updateState(fastify),
  getState: getState(fastify),
  getTransfers: getTransfers(fastify)
});
