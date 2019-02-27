const basePath = "/transfer";
routes = async (fastify, options) => {

  fastify.post(
    `${basePath}/:transferId/sendToVerification`,
    {
      schema: {
        type: "application/json",
        body: {
          amount: { type: "float" },
          currency: { type: "string" },
          senderId: { type: "string" },
          projectId: { type: "integer" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            response: { type: "object" }
          }
        }
      }
    },
    async (request, reply) => {
      const transferDao = require("../dao/transferDao")();
      fastify.log.info("[Transfer Routes] :: Send transfer to verification");
      const verification = await transferDao.sendTransferToVerification({
        transferId: request.params.transferId,
        amount: request.body.amount,
        currency: request.body.currency,
        senderId: request.body.senderId,
        projectId: request.body.projectId,
        destinationAccount: 2
      });
      if (!verification) reply.send({error: "Error when trying upload transfer information"});
      reply.send({sucess: "Transfer information upload sucessfuly!"})
    }
  ),

  fastify.post(
    `${basePath}/updateState`,
    {
      schema: {
        type: "application/json",
        body: {
          transferId: { type: "string" },
          state: { type: "integer" },
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            response: { type: "object" }
          }
        }
      }
    },
    async (request, reply) => {
      const transferDao = require("../dao/transferDao")();
      fastify.log.info("[Transfer Routes] :: Update transfer state");
      const verification = await transferDao.updateTransferState({
        transferId: request.body.transferId,
        state: request.body.state,
      });
      if (!verification) reply.send({error: "Error when trying upload transfer state"});
      reply.send({sucess: "Transfer information upload sucessfuly!"})
    }
  ),

  fastify.get(
    `${basePath}/:transferId/getState`,
    {
      schema: {
        params: {
          transferId: { type: "string" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            response: { type: "object" }
          }
        }
      }
    }
  ,
  async (request, reply) => {
    const transferDao = require("../dao/transferDao")();
    fastify.log.info(`[Transfer Routes] :: Getting state of transaction with id ${request.params.transferId}`);
    const transfer = await transferDao.getTransferById({transferId: request.params.transferId});
    if (!transfer) reply.send({error: `Can not find transfer with id: ${request.params.transferId}`});
    reply.send({
      transferId: transfer.transferId,
      state: transfer.state
    })
  })

};

module.exports = routes;
