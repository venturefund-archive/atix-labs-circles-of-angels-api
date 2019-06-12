/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/activities';
const restBasePath = '/activity';
const handlers = require('./handlers/activityHandlers');

const routes = {
  createActivity: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Creates a new activity for an existing Milestone especified in the body request',
        summary: 'Create new activity',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Modifies an existing activity',
        summary: 'Update activity',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Deletes an existing activity',
        summary: 'Delete activity',
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
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        description:
          'Uploads one or more evidence files to an existing activity',
        summary: 'Upload evidence',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Deletes an evidence file from an activity',
        summary: 'Delete evidence',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the information of an existing activity',
        summary: 'Get activity',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Assigns an existing oracle user to an existing activity',
        summary: 'Assign oracle to activity',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Unassigns an oracle user previously assigned to an activity',
        summary: 'Unassign oracle from activity',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Downloads an evidence file of an activity',
        summary: 'Download evidence',
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
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Completes an existing activity',
        summary: 'Complete activity',
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

module.exports = routes;
