/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

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
