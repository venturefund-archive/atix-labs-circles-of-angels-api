const basePath = '/userProject';
const handlersBuilder = require('./handlers/userProjectHandlers');

const routes = async fastify => {
  const handlers = handlersBuilder(fastify);

  return {
    signAgreement: {
      method: 'get',
      path: `${basePath}/:userId/:projectId/signAgreement`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          params: {
            userId: { type: 'integer' },
            projectId: { type: 'integer' }
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
      handler: handlers.signAgreement
    },

    getUsers: {
      method: 'get',
      path: `${basePath}/:projectId/getUsers`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          params: {
            projectId: { type: 'integer' }
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
      handler: handlers.getUsers
    },

    createUserProject: {
      method: 'get',
      path: `${basePath}/:userId/:projectId/create`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          params: {
            userId: { type: 'integer' },
            projectId: { type: 'integer' }
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
      handler: handlers.createUserProject
    }
  };
};

module.exports = routes;
