const basePath = '/questionnaire';
const handlers = require('./handlers/fileHandlers');

const routes = async fastify => ({
  getQuestionnaire: {
    method: 'get',
    path: `${basePath}/:roleId`,
    options: {
      schema: {
        params: {
          roleId: { type: 'integer' }
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
    handler: handlers.getQuestionnaire(fastify)
  }
});

module.exports = routes;
