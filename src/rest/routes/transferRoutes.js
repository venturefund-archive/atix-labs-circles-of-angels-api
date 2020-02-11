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
const {
  successResponse,
  clientErrorResponse,
  serverErrorResponse
} = require('../util/responses');

const idParam = description => ({
  type: 'object',
  properties: {
    projectId: {
      type: 'integer',
      description
    }
  }
});

const transferIdParam = idParam('Transfer unique id');
const projectIdParam = idParam('Project unique id');

const transferProperties = {
  transferId: { type: 'string' },
  senderId: { type: 'integer' },
  destinationAccount: { type: 'string' },
  amount: { type: 'number' },
  currency: { type: 'string' },
  receiptPath: { type: 'string' }
};

const transferStatusProperties = {
  status: { type: 'string' }
};

const successWithTransferIdResponse = {
  type: 'object',
  properties: {
    transferId: { type: 'integer' }
  },
  description: 'Returns the id of the created transfer'
};

const userResponse = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    address: { type: 'string' },
    createdAt: { type: 'string' },
    id: { type: 'integer' },
    role: { type: 'string' },
    blocked: { type: 'boolean' }
  },
  description: "User's information"
};

const successWithTransfersArray = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      transferId: { type: 'string' },
      destinationAccount: { type: 'string' },
      amount: { type: 'number' },
      currency: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'string' },
      id: { type: 'integer' },
      sender: userResponse,
      project: { type: 'integer' },
      receiptPath: { type: 'string' }
    }
  }
};

const transferRoutes = {
  createTransfer: {
    method: 'post',
    path: `/projects/:projectId${basePath}`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.POST.name],
        params: projectIdParam,
        description: 'Creates a new transfer to be verified by the admin',
        summary: 'Create new transfer',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: transferProperties,
            required: ['amount', 'currency', 'destinationAccount', 'transferId']
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
  },

  updateTransfer: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.PUT.name],
        description: 'Updates the status of an existing transfer',
        summary: 'Update transfer',
        params: transferIdParam,
        body: {
          type: 'object',
          properties: transferStatusProperties,
          required: ['status'],
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithTransferIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateTransfer
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
        params: projectIdParam,
        response: {
          ...successResponse(successWithTransfersArray),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getTransfers
  },

  addApprovedTransferClaim: {
    method: 'post',
    path: `${basePath}/:transferId/claim/approved`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.POST.name],
        description: 'Add an approved transfer claim of an existing project',
        summary: 'Add an approved transfer claim',
        params: { transferIdParam },
        response: {
          ...successResponse(successWithTransferIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addApprovedTransferClaim
  },

  addDisapprovedTransferClaim: {
    method: 'post',
    path: `${basePath}/:transferId/claim/disapproved`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.TRANSFER.name, routeTags.POST.name],
        description: 'Add an disapproved transfer claim of an existing project',
        summary: 'Add an disapproved transfer claim',
        params: { transferIdParam },
        body: {
          type: 'object',
          properties: {
            rejectionReason: { type: 'string' }
          }
        },
        response: {
          ...successResponse(successWithTransferIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addDisapprovedTransferClaim
  }
};

const routes = {
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

  ...transferRoutes
};

module.exports = routes;
