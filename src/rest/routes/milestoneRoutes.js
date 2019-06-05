const basePath = '/milestones';
const handlersBuilder = require('./handlers/milestoneHandlers');

const routes = async fastify => {
  const handlers = handlersBuilder(fastify);

  return {
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
      handler: handlers.getMilestones
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
      handler: handlers.updateBudgetStatus
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
      handler: handlers.getBudgetStatus
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
      handler: handlers.deleteMilestone
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
      handler: handlers.createMilestone
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
      handler: handlers.updateMilestone
    }
  };
};

module.exports = routes;
