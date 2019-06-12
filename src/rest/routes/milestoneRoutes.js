/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/milestones';
const handlers = require('./handlers/milestoneHandlers');

const routes = {
  getMilestones: {
    method: 'get',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns all existing milestones',
        summary: 'Get all milestones'
      },
      response: {
        200: {
          type: 'object',
          properties: {
            milestones: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    handler: handlers.getMilestones
  },

  updateBudgetStatus: {
    method: 'put',
    path: `${basePath}/:id/budgetStatus`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        description: 'Modifies the budget status of an existing milestone',
        summary: 'Update milestone budget status',
        params: {
          id: { type: 'number' }
        },
        body: {
          budgetStatusId: { type: 'number' }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.updateBudgetStatus
  },

  getBudgetStatus: {
    method: 'get',
    path: `${basePath}/budgetStatus`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the budget status of a milestone',
        summary: 'Get milestone budget status',
        response: {
          200: {
            type: 'object',
            properties: {
              budgetStatus: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    handler: handlers.getBudgetStatus
  },

  deleteMilestone: {
    method: 'delete',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Deletes an existing milestone',
        summary: 'Delete milestone',
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/json',
          properties: {
            response: { type: 'application/json' }
          }
        }
      }
    },
    handler: handlers.deleteMilestone
  },

  createMilestone: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Creates a new milestone for an existing project specified in the body request',
        summary: 'Create new milestone',
        type: 'application/json',
        body: {
          milestone: { type: 'object' },
          projectId: { type: 'number' }
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
    handler: handlers.createMilestone
  },

  updateMilestone: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Modifies an existing milestone',
        summary: 'Update milestone',
        type: 'application/json',
        params: {
          id: { type: 'number' }
        },
        body: {
          milestone: { type: 'object' }
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
    handler: handlers.updateMilestone
  }
};

module.exports = routes;
