const basePath = "/transfer";
routes = async (fastify, options) => {

  fastify.post(
    `${basePath}/sendTransferToVerification`,
    {
      schema: {
        type: "multipart/form-data",
        body: {
          transferId: { type: "string" },
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
        transferId: request.body.transferId,
        amount: request.body.amount,
        currency: request.body.currency,
        senderId: request.body.senderId,
        projectId: request.body.projectId,
        receiverId: 2
      });
      if (!verification) reply.send({error: "Error when trying upload transfer information"});
      reply.send({sucess: "Transfer information upload sucessfuly!"})
    }
  ),
  
  fastify.post(
    `${basePath}/updateState`,
    {
      schema: {
        type: "multipart/form-data",
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
  );

};

module.exports = routes;
