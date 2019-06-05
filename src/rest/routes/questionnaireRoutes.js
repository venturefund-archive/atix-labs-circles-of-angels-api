const basePath = '/questionnaire';
const handlersBuilder = require('./handlers/questionnaireHandlers');

const routes = async fastify => {
  const handlers = handlersBuilder(fastify);

  return {
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
};

module.exports = routes;
