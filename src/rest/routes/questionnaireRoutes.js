const basePath = '/questionnaire';
const handlers = require('./handlers/questionnaireHandlers');

const routes = {
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
    handler: handlers.getQuestionnaire
  }
};

module.exports = routes;
