/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/project';
const handlers = require('./handlers/projectHandlers');

const routes = {
  createProject: {
    method: 'post',
    path: `${basePath}/create`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Creates an new project in COA pending for approval',
        summary: 'Create new project',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: { type: 'object' }
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
    handler: handlers.createProject
  },

  getProjects: {
    method: 'get',
    path: `${basePath}/getProjects`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        description: 'Returns all existing projects in COA',
        summary: 'Get all projects'
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
    handler: handlers.getProjects
  },

  getActiveProjects: {
    method: 'get',
    path: `${basePath}/getActiveProjects`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns all existing active COA projects',
        summary: 'Get all active projects'
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
    handler: handlers.getActiveProjects
  },

  getProject: {
    method: 'get',
    path: `${basePath}/:projectId/getProject`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the specified project',
        summary: 'Get a project',
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
    handler: handlers.getProject
  },

  updateStatus: {
    method: 'post',
    path: `${basePath}/:projectId/updateStatus`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        description: 'Modifies the status of an existing project',
        summary: 'Update project status',
        type: 'application/json',
        body: {
          status: { type: 'int' }
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
    handler: handlers.updateStatus
  },

  deleteProject: {
    method: 'post',
    path: `${basePath}/:projectId/deleteProject`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        description: 'Deletes the specified project',
        summary: 'Delete project',
        params: {
          projectId: { type: 'integer' }
        },
        type: 'application/json'
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
    handler: handlers.deleteProject
  },

  getProjectMilestones: {
    method: 'get',
    path: `${basePath}/:projectId/getMilestones`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the milestones of the specified project',
        summary: 'Get project milestones',
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
    handler: handlers.getProjectMilestones
  },

  downloadMilestonesTemplate: {
    method: 'get',
    path: `${basePath}/downloadMilestonesTemplate`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the project milestones template file',
        summary: 'Get milestones template file',
        params: {
          projectId: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    handler: handlers.downloadMilestonesTemplate
  },

  downloadProposalTemplate: {
    method: 'get',
    path: `${basePath}/proposalTemplate`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the project proposal template file',
        summary: 'Get proposal template file',
        response: {
          200: {
            type: 'object',
            properties: {
              response: { type: 'object' }
            }
          }
        }
      }
    },
    handler: handlers.downloadProposalTemplate
  },

  getMilestonesFile: {
    method: 'get',
    path: `${basePath}/:projectId/getMilestonesFile`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: "Returns the specified project's milestones file",
        summary: 'Get a project milestones file',
        params: {
          projectId: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    handler: handlers.getMilestonesFile
  },

  uploadAgreement: {
    method: 'post',
    path: `${basePath}/:projectId/uploadAgreement`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Uploads agreement file to the specified project',
        summary: 'Upload agreement file',
        type: 'multipart/form-data',
        params: {
          projectId: { type: 'number' }
        },
        raw: {
          files: { type: 'object' }
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
    handler: handlers.uploadAgreement
  },

  downloadAgreement: {
    method: 'get',
    path: `${basePath}/:projectId/downloadAgreement`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Downloads the agreement file of the specified project',
        summary: 'Download agreement',
        type: 'multipart/form-data',
        params: {
          projectId: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    handler: handlers.downloadAgreement
  },

  downloadProposal: {
    method: 'get',
    path: `${basePath}/:projectId/downloadProposal`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the pitch proposal file of the specified project',
        summary: 'Download project pitch proposal',
        params: {
          projectId: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    handler: handlers.downloadProposal
  },

  updateProject: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Modifies the specified project information',
        summary: 'Update project information',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' }
          }
        },
        raw: {
          type: 'object',
          properties: {
            files: {
              type: 'object',
              properties: {
                projectCoverPhoto: { type: 'object' },
                projectCardPhoto: { type: 'object' }
              },
              additionalProperties: false
            },
            body: {
              type: 'object',
              properties: {
                project: {
                  type: 'object',
                  properties: {
                    projectName: { type: 'string' },
                    mission: { type: 'string' },
                    problemAddressed: { type: 'string' },
                    location: { type: 'string' },
                    timeframe: { type: 'string' },
                    goalAmount: { type: 'number' },
                    faqLink: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.updateProject
  },

  getTotalFunded: {
    method: 'get',
    path: `${basePath}/:id/alreadyFunded`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Returns the total amount of pledged funds for the specified project',
        summary: 'Get total funded amount',
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    handler: handlers.getTotalFunded
  },

  startProject: {
    method: 'put',
    path: `${basePath}/:id/start`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Mark an existing project as in progress when it is ready to start',
        summary: 'Start project',
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    handler: handlers.startProject
  },

  getProjectsByOracle: {
    method: 'get',
    path: `${basePath}/oracle/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Returns a list of all projects that the specified oracle has activities assigned to',
        summary: 'Get all projects of an oracle',
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    handler: handlers.getProjectsByOracle
  },

  uploadExperience: {
    method: 'post',
    path: `${basePath}/:id/experience`,
    options: {
      schema: {
        description: 'Uploads an experience to the specified project',
        summary: 'Upload experience to project',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    file: { type: 'string' }
                  }
                }
              }
            }
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.uploadExperience
  },

  getExperiences: {
    method: 'get',
    path: `${basePath}/:id/experiences`,
    options: {
      schema: {
        description: 'Returns all the experiences of the specified project',
        summary: 'Get project experiences',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              experiences: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    project: { type: 'number' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'number' }
                      }
                    },
                    photos: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          createdAt: { type: 'string' },
                          updatedAt: { type: 'string' }
                        }
                      }
                    },
                    comment: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' }
                  }
                }
              }
            }
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.getExperiences
  }
};

module.exports = routes;
