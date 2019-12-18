/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/transfers';
const handlers = require('./handlers/transferHandlers');
const routeTags = require('../util/routeTags');

const clientErrorResponse = () => ({
  '4xx': {
    type: 'object',
    properties: {
      status: { type: 'integer' },
      error: { type: 'string' }
    },
    description: 'Returns a message describing the error'
  }
});

const serverErrorResponse = () => ({
  500: {
    type: 'object',
    properties: {
      status: { type: 'integer' },
      error: { type: 'string' }
    },
    description: 'Returns a message describing the error'
  }
});

const successResponse = response => ({
  200: {
    ...response
  }
});

const transferProperties = {
  transferId: { type: 'string' },
  senderId: { type: 'integer' },
  destinationAccount: { type: 'string' },
  amount: { type: 'number' },
  currency: { type: 'string' },
  projectId: { type: 'integer' },
  receiptPath: { type: 'string' }
};

const successWithTransferIdResponse = {
  type: 'object',
  properties: {
    transferId: { type: 'integer' }
  },
  description: 'Returns the id of the created transfer'
};

const transferRoutes = {
  createTransfer: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.POST.name],
        description: 'Creates a new transfer to be verified by the admin',
        summary: 'Create new transfer',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: transferProperties,
            required: [
              'amount',
              'currency',
              'projectId',
              'destinationAccount',
              'transferId',
              'receiptPath'
            ]
          }
        },
        response: {
          ...successResponse(successWithTransferIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createTransfer
  }
};

const routes = {
  sendToVerification: {
    method: 'post',
    path: `${basePath}/send`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.POST.name],
        description: 'Creates a new transfer to be verified by the admin',
        summary: 'Create new transfer',
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            currency: { type: 'string' },
            senderId: { type: 'string' },
            projectId: { type: 'integer' },
            destinationAccount: { type: 'string' },
            transferId: { type: 'string' }
          },
          required: [
            'amount',
            'currency',
            'senderId',
            'projectId',
            'destinationAccount',
            'transferId'
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

  updateTransfer: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.PUT.name],
        description: 'Updates the state of an existing transfer',
        summary: 'Update transfer',
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Transfer to update'
            }
          }
        },
        body: {
          type: 'object',
          properties: {
            state: { type: 'integer' }
          },
          required: ['state'],
          additionalProperties: false
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
    handler: handlers.updateTransfer
  },

  getState: {
    method: 'get',
    path: `${basePath}/user/:userId/project/:projectId/state`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.GET.name],
        description: 'Returns the state of an existing transfer',
        summary: 'Get transfer state',
        params: {
          type: 'object',
          properties: {
            userId: { type: 'integer' },
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
    path: `/projects/:projectId${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.GET.name],
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
  },

  ...transferRoutes
};

module.exports = routes;
