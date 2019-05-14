const basePath = '/transfer';
const apiHelper = require('../services/helper');

const routes = async (fastify, options) => {
  fastify.post(
    `${basePath}/:transferId/sendToVerification`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        type: 'application/json',
        body: {
          amount: { type: 'float' },
          currency: { type: 'string' },
          senderId: { type: 'string' },
          projectId: { type: 'integer' },
          destinationAccount: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
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
    }
  );

  fastify.post(
    `${basePath}/updateState`,
    {
      beforeHandler: [fastify.adminAuth],
      schema: {
        type: 'application/json',
        body: {
          transferId: { type: 'string' },
          state: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
      const { transferService } = apiHelper.helper.services;
      fastify.log.info('[Transfer Routes] :: Update transfer state');
      const verification = await transferService.updateTransferState({
        transferId: request.body.transferId,
        state: request.body.state
      });
      if (!verification)
        reply.send({ error: 'Error when trying upload transfer state' });
      reply.send({ sucess: 'Transfer information upload sucessfuly!' });
    }
  );

  fastify.get(
    `${basePath}/:senderId/:projectId/getState`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          senderId: { type: 'integer' },
          projectId: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
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
    },

    async (request, reply) => {
      const { transferService } = apiHelper.helper.services;
      fastify.log.info(
        `[Transfer Routes] :: Getting state of transaction with id ${
          request.params.transferId
        }`
      );
      const status = await transferService.getTransferStatusById({
        transferId: request.params.transferId
      });
      reply.send({
        transferId: request.params.transferId,
        state: status
      });
    }
  );

  fastify.get(
    `${basePath}/:projectId/getTransfers`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          projectId: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
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
  );
};

module.exports = routes;
