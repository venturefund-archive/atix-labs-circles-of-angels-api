const basePath = '/files';
const handlers = require('./handlers/fileHandlers');

const routes = async fastify => ({
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
    handler: handlers.deleteFile(fastify)
  }
});

module.exports = routes;
