const basePath = '/milestones';
const handlers = require('./handlers/milestoneHandlers');

const routes = async fastify => ({
  getMilestones: {
    method: 'get',
    path: `${basePath}`,
    options: {
      beforeHandler: [fastify.generalAuth],
      response: {
        200: {
          type: 'object',
          properties: {
            milestones: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    handler: handlers.getMilestones(fastify)
  },

  updateBudgetStatus: {
    method: 'put',
    path: `${basePath}/:id/budgetStatus`,
    options: {
      beforeHandler: [fastify.generalAuth, fastify.withUser],
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
    handler: handlers.updateBudgetStatus(fastify)
  },

  getBudgetStatus: {
    method: 'get',
    path: `${basePath}/budgetStatus`,
    options: {
      beforeHandler: [fastify.generalAuth],
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
    handler: handlers.getBudgetStatus(fastify)
  },

  deleteMilestone: {
    method: 'delete',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: [fastify.generalAuth],
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
    handler: handlers.deleteMilestone(fastify)
  },

  createMilestone: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: [fastify.generalAuth],
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
    handler: handlers.createMilestone(fastify)
  },

  updateMilestone: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: [fastify.generalAuth],
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
    handler: handlers.updateMilestone(fastify)
  }
});

module.exports = routes;
