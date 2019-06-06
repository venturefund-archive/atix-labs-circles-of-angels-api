const basePath = '/userProject';
const handlers = require('./handlers/userProjectHandlers');

const routes = {
  signAgreement: {
    method: 'get',
    path: `${basePath}/:userId/:projectId/signAgreement`,
    options: {
      beforeHandler: ['generalAuth'],
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
      beforeHandler: ['generalAuth'],
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
      beforeHandler: ['generalAuth'],
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

module.exports = routes;
