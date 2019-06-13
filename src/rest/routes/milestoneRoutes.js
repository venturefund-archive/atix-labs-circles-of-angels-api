/**
 * AGPL License
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
