const basePath = '/questionnaire';
const handlers = require('./handlers/questionnaireHandlers');

const routes = {
  getQuestionnaire: {
    method: 'get',
    path: `${basePath}/:roleId`,
    options: {
      schema: {
        description:
          'Returns the onboarding questions and their corresponding ' +
          'answers for the specified role',
        summary: 'Get onboarding Q&A',
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
