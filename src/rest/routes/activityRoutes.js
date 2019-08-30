/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/activities';
const handlers = require('./handlers/activityHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  createActivity: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description:
          'Creates a new activity for an existing Milestone specified in the body request',
        summary: 'Create new activity',
        type: 'object',
        body: {
          type: 'object',
          properties: {
            activity: {
              type: 'object',
              properties: {
                tasks: { type: 'string' },
                impact: { type: 'string' },
                impactCriterion: { type: 'string' },
                signsOfSuccess: { type: 'string' },
                signsOfSuccessCriterion: { type: 'string' },
                category: { type: 'string' },
                keyPersonnel: { type: 'string' },
                budget: { type: 'number' }
              },
              description: 'New activity object'
            },
            milestoneId: {
              type: 'integer',
              description: 'Milestone to which the activity belongs to'
            }
          },
          required: ['activity', 'milestoneId']
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the activity was created',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' },
              status: { type: 'integer' }
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
    handler: handlers.createActivity
  },

  updateActivity: {
    method: 'put',
    path: `${basePath}/:activityId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.PUT.name],
        description: 'Modifies an existing activity',
        summary: 'Update activity',
        type: 'object',
        params: {
          type: 'object',
          properties: {
            activityId: { type: 'integer', description: 'Activity to modify' }
          }
        },
        body: {
          type: 'object',
          properties: {
            activity: {
              type: 'object',
              properties: {
                tasks: { type: 'string' },
                impact: { type: 'string' },
                impactCriterion: { type: 'string' },
                signsOfSuccess: { type: 'string' },
                signsOfSuccessCriterion: { type: 'string' },
                category: { type: 'string' },
                keyPersonnel: { type: 'string' },
                budget: { type: 'number' }
              },
              additionalProperties: false,
              description: 'Fields to modify'
            }
          },
          required: ['activity']
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the activity was updated',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' },
              status: { type: 'integer' }
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
    handler: handlers.updateActivity
  },

  updateStatus: {
    method: 'put',
    path: `${basePath}/:activityId/status`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.PUT.name],
        description: 'Modifies the statuus of an existing activity',
        summary: 'Update activity status',
        type: 'object',
        params: {
          type: 'object',
          properties: {
            activityId: {
              type: 'integer',
              description: 'Activity to modify'
            }
          }
        },
        body: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              minimum: 1,
              maximum: 4,
              description: 'New activity status'
            }
          },
          additionalProperties: false
        },
        required: ['activity']
      },
      response: {
        200: {
          type: 'object',
          description: 'Success message if the activity was updated',
          properties: {
            success: { type: 'string' }
          }
        },
        '4xx': {
          type: 'object',
          description: 'Returns a message describing the error',
          properties: {
            error: { type: 'string' },
            status: { type: 'integer' }
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
    },
    handler: handlers.updateStatus
  },

  deleteActivity: {
    method: 'delete',
    path: `${basePath}/:activityId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.DELETE.name],
        description: 'Deletes an existing activity',
        summary: 'Delete activity',
        params: {
          type: 'object',
          properties: {
            activityId: { type: 'integer', description: 'Activity to delete' }
          }
        },
        response: {
          200: {
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
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              transactionHash: { type: 'string' },
              id: { type: 'integer' },
              milestone: { type: 'integer' },
              status: { type: 'integer' },
              blockchainStatus: { type: 'integer' }
            },
            description: 'Returns the deleted activity'
          },
          500: {
            type: 'string',
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.deleteActivity
  },

  uploadEvidence: {
    method: 'post',
    path: `${basePath}/:activityId/evidence`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description:
          'Uploads one or more evidence files to an existing activity.\n' +
          "Receives a form-data with the attribute 'evidenceFiles' as an array of files.",
        summary: 'Upload evidence',
        type: 'multipart/form-data',
        params: {
          type: 'object',
          properties: {
            activityId: {
              type: 'integer',
              description: 'Activity to upload the evidence to'
            }
          }
        },
        raw: {
          files: {
            type: 'object',
            properties: { evidenceFiles: { type: 'object' } }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: {
                type: 'string',
                description: 'Success message if the files were uploaded'
              },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    file: { type: 'string' }
                  }
                },
                description:
                  'Array of errors for the files that failed to upload'
              }
            }
          },
          500: {
            type: 'object',
            properties: { error: { type: 'string' } },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.uploadEvidence
  },

  deleteEvidence: {
    method: 'delete',
    path: `${basePath}/:activityId/evidence/:evidenceId/:fileType`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.DELETE.name],
        description: 'Deletes an evidence file from an activity',
        summary: 'Delete evidence',
        params: {
          type: 'object',
          properties: {
            activityId: {
              type: 'integer',
              description: 'Activity to delete the evidence from'
            },
            evidenceId: {
              type: 'integer',
              description: 'Evidence file to delete'
            },
            fileType: {
              type: 'string',
              enum: ['File', 'Photo'],
              description:
                "Evidence file type. Allowed values: 'Photo' for images, 'File' for anything else"
            }
          }
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the evidence was deleted',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' },
              status: { type: 'integer' }
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
    handler: handlers.deleteEvidence
  },

  getActivity: {
    method: 'get',
    path: `${basePath}/:activityId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.GET.name],
        description: 'Returns the details of an existing activity',
        summary: 'Get activity details',
        params: {
          type: 'object',
          properties: {
            activityId: {
              type: 'integer',
              description: 'Activity to get details'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            description: 'Returns the activity object with its details',
            properties: {
              signsOfSuccessCriterion: { type: 'string' },
              category: { type: 'string' },
              keyPersonnel: { type: 'string' },
              budget: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              transactionHash: { type: 'string' },
              id: { type: 'integer' },
              milestone: { type: 'integer' },
              status: { type: 'integer' },
              blockchainStatus: { type: 'integer' },
              evidence: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    id: { type: 'integer' },
                    fileHash: { type: 'string' },
                    activity: { type: 'integer' },
                    photo: { type: 'integer' },
                    fileType: { type: 'string' },
                    fileName: { type: 'string' }
                  }
                }
              },
              oracle: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
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
                  },
                  activity: { type: 'integer' }
                }
              }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' },
              status: { type: 'integer' }
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
    handler: handlers.getActivity
  },

  assignOracle: {
    method: 'post',
    path: `${basePath}/:activityId/oracle/:userId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description: 'Assigns an existing oracle user to an existing activity',
        summary: 'Assign oracle to activity',
        params: {
          type: 'object',
          properties: {
            activityId: {
              type: 'integer',
              description: 'Activity to assign the oracle to'
            },
            userId: {
              type: 'integer',
              description: 'Oracle user to assign to the activity'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            description:
              'Success message if the oracle was assigned to the activity',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' },
              status: { type: 'integer' }
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
    handler: handlers.assignOracle
  },

  unassignOracle: {
    method: 'delete',
    path: `${basePath}/:activityId/oracle`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.DELETE.name],
        description:
          'Unassigns an oracle user previously assigned to an activity',
        summary: 'Unassign oracle from activity',
        params: {
          type: 'object',
          properties: {
            activityId: {
              type: 'integer',
              description: 'Activity to remove oracle from'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            description:
              'Success message if the activity had its oracle removed',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' },
              status: { type: 'integer' }
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
    handler: handlers.unassignOracle
  },

  downloadEvidence: {
    method: 'get',
    path: `${basePath}/:activityId/evidence/:evidenceId/:fileType`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.GET.name],
        description:
          "Downloads an evidence file of an activity. Returns the file name in 'file' header",
        summary: 'Download evidence',
        params: {
          type: 'object',
          properties: {
            activityId: {
              type: 'integer',
              description: 'Activity to download the evidence'
            },
            evidenceId: {
              type: 'integer',
              description: 'Evidence file to download'
            },
            fileType: {
              type: 'string',
              enum: ['File', 'Photo'],
              description:
                "Evidence file type. Allowed values: 'Photo' for images, 'File' for anything else"
            }
          }
        },
        response: {
          200: { type: 'string', description: 'Evidence file stream' },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' },
              status: { type: 'integer' }
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
    handler: handlers.downloadEvidence
  }
};

module.exports = routes;
