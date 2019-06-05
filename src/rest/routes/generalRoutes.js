const basePath = '/general';
const handlers = require('./handlers/generalHandlers');

const routes = async (fastify, options) => ({
  getAccountDestination: {
    method: 'get',
    path: `${basePath}/accountDestination`,
    options: {
      beforeHandler: [fastify.generalAuth],
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    hanlder: handlers.getAccountDestination
  }
});

module.exports = routes;
