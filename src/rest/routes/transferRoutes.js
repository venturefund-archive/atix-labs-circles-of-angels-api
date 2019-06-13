/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

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
        params: {
          type: 'object',
          properties: {
            transferId: { type: 'integer' }
          }
        },
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            currency: { type: 'string' },
            senderId: { type: 'string' },
            projectId: { type: 'integer' },
            destinationAccount: { type: 'string' }
          },
          required: [
            'amount',
            'currency',
            'senderId',
            'projectId',
            'destinationAccount'
          ]
        },
        response: {
          200: {
            type: 'object',
            properties: {
              sucess: { type: 'string' }
            }
          },
          409: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
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
        body: {
          type: 'object',
          properties: {
            transferId: { type: 'string' },
            state: { type: 'integer' }
          },
          required: ['transferId', 'state']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              sucess: { type: 'string' }
            }
          },
          409: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
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
          type: 'object',
          properties: {
            senderId: { type: 'integer' },
            projectId: { type: 'integer' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              state: {
                type: 'object',
                properties: {
                  status: { type: 'integer' },
                  name: { type: 'string' }
                }
              }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: {
                type: 'string'
              }
            }
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
          type: 'object',
          properties: {
            projectId: { type: 'integer' }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transferId: { type: 'string' },
                destinationAccount: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string' },
                state: { type: 'integer' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                id: { type: 'integer' },
                sender: { type: 'integer' },
                project: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    handler: handlers.getTransfers
  }
};

module.exports = routes;
