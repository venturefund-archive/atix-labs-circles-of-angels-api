const basePath = '/transfer';
const handlers = require('./handlers/transferHandlers');

const routes = {
  sendToVerification: {
    method: 'post',
    path: `${basePath}/:transferId/sendToVerification`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Creates a new transfer to be verified by the admin',
        summary: 'Create new transfer',
        type: 'application/json',
        body: {
          amount: { type: 'float' },
          currency: { type: 'string' },
          senderId: { type: 'string' },
          projectId: { type: 'integer' },
          destinationAccount: { type: 'string' }
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
    handler: handlers.sendToVerification
  },

  updateState: {
    method: 'post',
    path: `${basePath}/updateState`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        description: 'Updates the state of an existing transfer',
        summary: 'Update transfer state',
        type: 'application/json',
        body: {
          transferId: { type: 'string' },
          state: { type: 'integer' }
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
    handler: handlers.updateState
  },

  getState: {
    method: 'get',
    path: `${basePath}/:senderId/:projectId/getState`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the state of an existing transfer',
        summary: 'Get transfer state',
        params: {
          senderId: { type: 'integer' },
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
    handler: handlers.getState
  },

  getTransfers: {
    method: 'get',
    path: `${basePath}/:projectId/getTransfers`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns all the transfers related to a project',
        summary: 'Get all transfers by project',
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
    handler: handlers.getTransfers
  }
};

module.exports = routes;
