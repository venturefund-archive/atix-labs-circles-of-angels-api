const basePath = '/files';
const handlersBuilder = require('./handlers/fileHandlers');

const routes = async fastify => {
  const handlers = handlersBuilder(fastify);

  return {
    deleteFile: {
      method: 'delete',
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
            type: 'object',
            properties: {
              response: { type: 'object' }
            }
          }
        }
      },
      handler: handlers.deleteFile
    }
  };
};

module.exports = routes;
