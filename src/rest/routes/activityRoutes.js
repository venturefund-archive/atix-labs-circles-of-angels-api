const basePath = '/activities';
const restBasePath = '/activity';
const handlersBuilder = require('./handlers/activityHandlers');

const routes = async fastify => {
  const handlers = handlersBuilder(fastify);

  return {
    createActivity: {
      method: 'post',
      path: `${basePath}`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          type: 'application/json',
          body: {
            activity: { type: 'object' },
            milestoneId: { type: 'number' }
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
      handler: handlers.createActivity
    },

    updateActivity: {
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
            activity: { type: 'object' }
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
      handler: handlers.updateActivity
    },

    deleteActivity: {
      method: 'delete',
      path: `${restBasePath}/:id`,
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
      handler: handlers.deleteActivity
    },

    uploadEvidence: {
      method: 'post',
      path: `${basePath}/:id/evidences`,
      options: {
        beforeHandler: [fastify.generalAuth, fastify.withUser],
        schema: {
          type: 'multipart/form-data',
          params: {
            id: { type: 'number' }
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
      handler: handlers.uploadEvidence
    },

    deleteEvidence: {
      method: 'delete',
      path: `${basePath}/:activityId/evidences/:evidenceId/:fileType`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          params: {
            id: { type: 'number' }
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
      handler: handlers.deleteEvidence
    },

    getActivity: {
      method: 'get',
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
            type: 'object',
            properties: {
              response: { type: 'object' }
            }
          }
        }
      },
      handler: handlers.getActivity
    },

    assignOracle: {
      method: 'put',
      path: `${basePath}/:id/assignOracle/:userId`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          params: {
            id: { type: 'number' },
            userId: { type: 'number' }
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
      handler: handlers.assignOracle
    },

    unassignOracle: {
      method: 'delete',
      path: `${basePath}/:id/unassignOracle`,
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
      handler: handlers.unassignOracle
    },

    downloadEvidence: {
      method: 'get',
      path: `${basePath}/:activityId/evidences/:evidenceId/download/:fileType`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          params: {
            activityId: { type: 'number' },
            evidenceId: { type: 'number' },
            fileType: { type: 'string' }
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
      handler: handlers.downloadEvidence
    },

    completeActivity: {
      method: 'post',
      path: `${basePath}/:activityId/complete`,
      options: {
        beforeHandler: [fastify.generalAuth],
        schema: {
          params: {
            activityId: { type: 'number' }
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
      handler: handlers.completeActivity
    }
  };
};

module.exports = routes;
