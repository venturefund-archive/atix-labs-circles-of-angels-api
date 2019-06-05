const basePath = '/photos';
const handlers = require('./handlers/photoHandlers');

const routes = async (fastify, options) => ({
  getPhoto: {
    method: 'get',
    path: `${basePath}/:id`,
    options: {
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
    handler: handlers.getPhoto(fastify)
  }
});

module.exports = routes;
