/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/userProjects';
const handlers = require('./handlers/userProjectHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  signAgreement: {
    method: 'put',
    path: `${basePath}/users/:userId/projects/:projectId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER_PROJECT.name, routeTags.PUT.name],
        description:
          'Sign the agreement of an existing project by an existing funder',
        summary: 'Funder sign project agreement',
        params: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer',
              description: 'User that will be signing the agreement'
            },
            projectId: {
              type: 'integer',
              description: 'Project to which the agreement document belongs to'
            }
          }
        },
        response: {
          200: {
            description: 'Returns the record that was modified',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'integer' },
                id: { type: 'integer' },
                user: { type: 'integer' },
                project: { type: 'integer' }
              }
            }
          },
          '4xx': {
            description: 'Returns a message describing the error',
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.signAgreement
  },

  getUsers: {
    method: 'get',
    path: `${basePath}/projects/:projectId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER_PROJECT.name, routeTags.GET.name],
        description:
          'Returns all funders related to a project and their signature status',
        summary: 'Get all funders and signatures by project',
        params: {
          type: 'object',
          properties: {
            projectId: {
              description: 'Project to get the users from',
              type: 'integer'
            }
          }
        },
        response: {
          200: {
            type: 'array',
            description: 'Returns a list of user-project objects',
            items: {
              type: 'object',
              properties: {
                status: { type: 'integer' },
                id: { type: 'integer' },
                project: { type: 'integer' },
                user: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    address: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    id: { type: 'integer' },
                    role: { type: 'integer' },
                    registrationStatus: { type: 'integer' }
                  }
                }
              }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
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
        tags: [routeTags.USER_PROJECT.name, routeTags.GET.name],
        description:
          'Creates a new relation between an existing funder and an existing project',
        summary: 'Associate a funder to a project',
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
            description: 'Success message if the relation was created',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.createUserProject
  }
};

module.exports = routes;
