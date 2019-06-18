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
      schema: {
        description: 'Returns all existing milestones',
        summary: 'Get all milestones'
      },
      response: {
        200: {
          type: 'object',
          description:
            'Returns an array with all milestones and their project information',
          properties: {
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tasks: { type: 'string' },
                  impact: { type: 'string' },
                  impactCriterion: { type: 'string' },
                  signsOfSuccess: { type: 'string' },
                  signsOfSuccessCriterion: { type: 'string' },
                  category: { type: 'string' },
                  keyPersonnel: { type: 'string' },
                  budget: { type: 'string' },
                  quarter: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  transactionHash: { type: 'string' },
                  id: { type: 'integer' },
                  project: {
                    type: 'object',
                    properties: {
                      projectName: { type: 'string' },
                      mission: { type: 'string' },
                      problemAddressed: { type: 'string' },
                      location: { type: 'string' },
                      timeframe: { type: 'string' },
                      pitchProposal: { type: 'string' },
                      faqLink: { type: 'string' },
                      milestonesFile: { type: 'string' },
                      goalAmount: { type: 'integer' },
                      status: { type: 'integer' },
                      ownerId: { type: 'integer' },
                      projectAgreement: { type: 'string' },
                      createdAt: { type: 'string' },
                      updatedAt: { type: 'string' },
                      transactionHash: { type: 'string' },
                      creationTransactionHash: { type: 'string' },
                      id: { type: 'integer' },
                      startBlockchainStatus: { type: 'integer' },
                      coverPhoto: { type: 'integer' },
                      cardPhoto: { type: 'integer' },
                      blockchainStatus: { type: 'integer' }
                    }
                  },
                  status: {
                    type: 'object',
                    properties: {
                      status: { type: 'integer' },
                      name: { type: 'string' }
                    }
                  },
                  budgetStatus: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      name: { type: 'string' }
                    }
                  },
                  blockchainStatus: { type: 'integer' }
                }
              }
            }
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
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Milestone to update budget status'
            }
          }
        },
        body: {
          type: 'object',
          properties: {
            budgetStatusId: {
              type: 'integer',
              description: 'New budget status'
            }
          },
          required: ['budgetStatusId']
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the milestone was updated',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              status: { type: 'integer' },
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
    handler: handlers.updateBudgetStatus
  },

  getBudgetStatus: {
    method: 'get',
    path: `${basePath}/budgetStatus`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns all valid budget status',
        summary: 'Get valid budget status',
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
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Milestone to delete' }
          }
        },
        response: {
          200: {
            type: 'array',
            description: 'Returns an object with the deleted milestone',
            items: {
              type: 'object',
              properties: {
                tasks: { type: 'string' },
                impact: { type: 'string' },
                impactCriterion: { type: 'string' },
                signsOfSuccess: { type: 'string' },
                signsOfSuccessCriterion: { type: 'string' },
                category: { type: 'string' },
                keyPersonnel: { type: 'string' },
                budget: { type: 'string' },
                quarter: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                transactionHash: { type: 'string' },
                id: { type: 'integer' },
                project: { type: 'integer' },
                status: { type: 'integer' },
                budgetStatus: { type: 'integer' },
                blockchainStatus: { type: 'integer' }
              }
            }
          },
          500: {
            type: 'string',
            description: 'Returns a message describing the error'
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
        type: 'object',
        body: {
          type: 'object',
          properties: {
            milestone: {
              type: 'object',
              properties: {
                quarter: { type: 'string' },
                tasks: { type: 'string' },
                impact: { type: 'string' },
                impactCriterion: { type: 'string' },
                signsOfSuccess: { type: 'string' },
                signsOfSuccessCriterion: { type: 'string' },
                category: { type: 'string' },
                keyPersonnel: { type: 'string' },
                budget: { type: 'string' }
              },
              description: 'New milestone object'
            },
            projectId: {
              type: 'integer',
              description: 'Project to which the new milestone belongs to'
            }
          },
          required: ['milestone', 'projectId']
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the milestone was created',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              status: { type: 'integer' },
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
        type: 'object',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Milestone to update' }
          }
        },
        body: {
          type: 'object',
          properties: {
            milestone: {
              type: 'object',
              properties: {
                quarter: { type: 'string' },
                tasks: { type: 'string' },
                impact: { type: 'string' },
                impactCriterion: { type: 'string' },
                signsOfSuccess: { type: 'string' },
                signsOfSuccessCriterion: { type: 'string' },
                category: { type: 'string' },
                keyPersonnel: { type: 'string' },
                budget: { type: 'string' },
                budgetStatus: { type: 'integer' }
              },
              additionalProperties: false,
              description: 'Fields to modify'
            }
          },
          required: ['milestone']
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the milestone was updated',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              status: { type: 'integer' },
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
    handler: handlers.updateMilestone
  }
};

module.exports = routes;
