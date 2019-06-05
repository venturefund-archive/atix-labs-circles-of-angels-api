const basePath = '/transfer';
const handlers = require('./handlers/transferHandlers');

const routes = {
  sendToVerification: {
    method: 'post',
    path: `${basePath}/:transferId/sendToVerification`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
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
