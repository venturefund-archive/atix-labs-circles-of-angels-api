const basePath = '/photos';
const apiHelper = require('../services/helper');

const routes = async (fastify, options) => {
  fastify.get(
    `${basePath}/:id`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          id: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'image',
          properties: {
            response: { type: 'image' }
          }
        }
      }
    },
    async (request, reply) => {
      const { photoService } = apiHelper.helper.services;
      const { id } = request.params;
      fastify.log.info(`[Photo Routes] :: Getting photo ID ${id}`);

      try {
        const res = await photoService.getBase64Photo(id);

        if (res && res.error) {
          fastify.log.error(
            `[Photo Routes] :: Error getting photo ID ${id}:`,
            res.error
          );
          reply.status(res.status).send(res.error);
        } else {
          fastify.log.info('[Photo Routes] :: Serving photo ID', id);

          reply.send(res);
        }
      } catch (error) {
        fastify.log.error(
          `[Photo Routes] :: Error getting photo ID ${id}:`,
          error
        );
        reply.status(500).send({ error: 'Error getting photo' });
      }
    }
  );
};

module.exports = routes;
