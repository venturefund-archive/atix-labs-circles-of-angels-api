const basePath = '/project';
const handlers = './handlers/projectHandlers';

const routes = async fastify => ({
  createProject: {
    method: 'post',
    path: `${basePath}/create`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.createProject(fastify)
  },

  getProjects: {
    method: 'get',
    path: `${basePath}/getProjects`,
    options: {
      beforeHandler: [fastify.adminAuth],
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    handler: handlers.getProjects(fastify)
  },

  getActiveProjects: {
    method: 'get',
    path: `${basePath}/getActiveProjects`,
    options: {
      beforeHandler: [fastify.generalAuth],
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    handler: handlers.getActiveProjects(fastify)
  },

  getProject: {
    method: 'get',
    path: `${basePath}/:projectId/getProject`,
    options: {
      beforeHandler: [fastify.generalAuth],
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
    handler: handlers.getProject(fastify)
  },

  updateStatus: {
    method: 'post',
    path: `${basePath}/:projectId/updateStatus`,
    options: {
      beforeHandler: [fastify.adminAuth],
      schema: {
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
    handler: handlers.updateStatus(fastify)
  },

  deleteProject: {
    method: 'post',
    path: `${basePath}/:projectId/deleteProject`,
    options: {
      beforeHandler: [fastify.adminAuth],
      schema: {
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
    handler: handlers.deleteProject(fastify)
  },

  getProjectMilestones: {
    method: 'get',
    path: `${basePath}/:projectId/getMilestones`,
    options: {
      beforeHandler: [fastify.generalAuth],
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
    handler: handlers.getProjectMilestones(fastify)
  },

  downloadMilestonesTemplate: {
    method: 'get',
    path: `${basePath}/downloadMilestonesTemplate`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.downloadMilestonesTemplate(fastify)
  },

  downloadProposalTemplate: {
    method: 'get',
    path: `${basePath}/proposalTemplate`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.downloadProposalTemplate(fastify)
  },

  getMilestonesFile: {
    method: 'get',
    path: `${basePath}/:projectId/getMilestonesFile`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.getMilestonesFile(fastify)
  },

  uploadAgreement: {
    method: 'post',
    path: `${basePath}/:projectId/uploadAgreement`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.uploadAgreement(fastify)
  },

  downloadAgreement: {
    method: 'get',
    path: `${basePath}/:projectId/downloadAgreement`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.downloadAgreement(fastify)
  },

  downloadProposal: {
    method: 'get',
    path: `${basePath}/:projectId/downloadProposal`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.downloadProposal(fastify)
  },

  updateProject: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.updateProject(fastify)
  },

  getTotalFunded: {
    method: 'get',
    path: `${basePath}/:id/alreadyFunded`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    handler: handlers.getTotalFunded(fastify)
  },

  startProject: {
    method: 'put',
    path: `${basePath}/:id/start`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    handler: handlers.startProject(fastify)
  },

  getProjectsByOracle: {
    method: 'get',
    path: `${basePath}/oracle/:id`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    handler: handlers.getProjectsByOracle(fastify)
  },

  uploadExperience: {
    method: 'post',
    path: `${basePath}/:id/experience`,
    options: {
      schema: {
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
    handler: handlers.uploadExperience(fastify)
  },

  getExperiences: {
    method: 'get',
    path: `${basePath}/:id/experiences`,
    options: {
      schema: {
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
    handler: handlers.getExperiences(fastify)
  }
});

module.exports = routes;
