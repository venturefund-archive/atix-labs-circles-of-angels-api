const basePath = '/userProject';
const handlers = require('./handlers/userProjectHandlers');

const routes = {
  signAgreement: {
    method: 'get',
    path: `${basePath}/:userId/:projectId/signAgreement`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Sign the agreement of an existing project by an existing funder',
        summary: 'Funder sign project agreement',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns all funders related to a project',
        summary: 'Get all funders by project',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Creates a new relation between an existing funder and an existing project',
        summary: 'Associate a funder to a project',
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

module.exports = routes;
