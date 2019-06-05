const basePath = '/photos';
const handlersBuilder = require('./handlers/photoHandlers');

const routes = async (fastify, options) => {
  const handlers = handlersBuilder(fastify);

  return {
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
      handler: handlers.getPhoto
    }
  };
};

module.exports = routes;
