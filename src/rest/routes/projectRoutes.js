/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/projects';
const handlers = require('./handlers/projectHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  createProject: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates an new project in COA pending for approval',
        summary: 'Create new project',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: { type: 'object' }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              sucess: { type: 'string' }
            },
            description: 'Returns a success message if the project was created'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              error: { type: 'string' },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    rowNumber: { type: 'integer' },
                    msg: { type: 'string' }
                  }
                },
                description: 'Array of objects of errors in the milestone file'
              }
            },
            description:
              'Returns a message describing the error ' +
              'and an array of errors if the milestone files had any'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.createProject
  },

  getProjects: {
    method: 'get',
    path: `${basePath}`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns all existing projects in COA',
        summary: 'Get all projects',
        response: {
          200: {
            type: 'array',
            items: {
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
                goalAmount: { type: 'number' },
                status: { type: 'integer' },
                ownerId: { type: 'integer' },
                projectAgreement: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                transactionHash: { type: 'string' },
                creationTransactionHash: { type: 'string' },
                id: { type: 'integer' },
                startBlockchainStatus: { type: 'integer' },
                coverPhoto: { type: ['integer', 'null'] },
                cardPhoto: { type: ['integer', 'null'] },
                blockchainStatus: { type: 'integer' },
                ownerName: { type: 'string' },
                ownerEmail: { type: 'string' }
              }
            },
            description:
              'Returns an array of objects with the information of the projects'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getProjects
  },

  getActiveProjects: {
    method: 'get',
    path: `${basePath}/active`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns all existing active COA projects',
        summary: 'Get all active projects',
        response: {
          200: {
            type: 'array',
            items: {
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
                goalAmount: { type: 'number' },
                status: { type: 'integer' },
                ownerId: { type: 'integer' },
                projectAgreement: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                transactionHash: { type: 'string' },
                creationTransactionHash: { type: 'string' },
                id: { type: 'integer' },
                startBlockchainStatus: { type: 'integer' },
                coverPhoto: { type: ['integer', 'null'] },
                cardPhoto: { type: ['integer', 'null'] },
                blockchainStatus: { type: 'integer' },
                ownerName: { type: 'string' },
                ownerEmail: { type: 'string' }
              }
            },
            description:
              'Returns an array of objects with the information of the projects'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getActiveProjects
  },

  getProject: {
    method: 'get',
    path: `${basePath}/:projectId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the specified project',
        summary: 'Get a project',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to get the details'
            }
          }
        },
        response: {
          200: {
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
              goalAmount: { type: 'number' },
              status: { type: 'integer' },
              ownerId: { type: 'integer' },
              projectAgreement: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              transactionHash: { type: 'string' },
              creationTransactionHash: { type: 'string' },
              id: { type: 'integer' },
              startBlockchainStatus: { type: 'integer' },
              coverPhoto: { type: ['integer', 'null'] },
              cardPhoto: { type: ['integer', 'null'] },
              blockchainStatus: { type: 'integer' },
              ownerName: { type: 'string' },
              ownerEmail: { type: 'string' },
              totalFunded: { type: 'number' }
            },
            description: 'Returns an object with the information of the project'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getProject
  },

  deleteProject: {
    method: 'delete',
    path: `${basePath}/:projectId`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.DELETE.name],
        description: 'Deletes the specified project',
        summary: 'Delete project',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to delete'
            }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
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
                goalAmount: { type: 'number' },
                status: { type: 'integer' },
                ownerId: { type: 'integer' },
                projectAgreement: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                transactionHash: { type: 'string' },
                creationTransactionHash: { type: 'string' },
                id: { type: 'integer' },
                startBlockchainStatus: { type: 'integer' },
                coverPhoto: { type: ['integer', 'null'] },
                cardPhoto: { type: ['integer', 'null'] },
                blockchainStatus: { type: 'integer' },
                ownerName: { type: 'string' },
                ownerEmail: { type: 'string' }
              }
            },
            description:
              'Returns an array of an object with the information of the deleted project'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.deleteProject
  },

  getProjectMilestones: {
    method: 'get',
    path: `${basePath}/:projectId/milestones`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the milestones of the specified project',
        summary: 'Get project milestones',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to get the milestones from'
            }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                activities: {
                  type: 'array',
                  description: "Array of the milestone's activities",
                  items: {
                    type: 'object',
                    description: 'Activity object',
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
                      blockchainStatus: { type: 'integer' },
                      type: { type: 'string' },
                      quarter: { type: 'string' },
                      oracle: {
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
                      }
                    }
                  }
                },
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
                blockchainStatus: { type: 'integer' },
                type: { type: 'string' }
              },
              description: 'Milestone information'
            },
            description:
              'Returns an array of objects with each milestone information'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getProjectMilestones
  },

  downloadMilestonesTemplate: {
    method: 'get',
    path: `${basePath}/templates/milestones`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the project milestones template file',
        summary: 'Get milestones template file',
        response: {
          200: { type: 'string', description: 'Template file stream' },
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
    handler: handlers.downloadMilestonesTemplate
  },

  downloadProposalTemplate: {
    method: 'get',
    path: `${basePath}/templates/proposal`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the project proposal template file',
        summary: 'Get proposal template file',
        response: {
          200: { type: 'string', description: 'Template file stream' },
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
    handler: handlers.downloadProposalTemplate
  },

  getMilestonesFile: {
    method: 'get',
    path: `${basePath}/:projectId/milestonesFile`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: "Returns the specified project's milestones file",
        summary: 'Get a project milestones file',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to download the milestones file from'
            }
          }
        },
        response: {
          200: { type: 'string', description: 'Milestone file stream' },
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
    handler: handlers.getMilestonesFile
  },

  uploadAgreement: {
    method: 'post',
    path: `${basePath}/:projectId/agreement`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Uploads agreement file to the specified project',
        summary: 'Upload agreement file',
        type: 'multipart/form-data',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to upload the agreement file to'
            }
          }
        },
        raw: {
          files: { type: 'object' }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            },
            description: 'Returns a success message if the file was uploaded'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.uploadAgreement
  },

  downloadAgreement: {
    method: 'get',
    path: `${basePath}/:projectId/agreement`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Downloads the agreement file of the specified project',
        summary: 'Download agreement',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to download the agreement file from'
            }
          }
        },
        response: {
          200: { type: 'string', description: 'Agreement file stream' },
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
    handler: handlers.downloadAgreement
  },

  downloadProposal: {
    method: 'get',
    path: `${basePath}/:projectId/proposal`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the pitch proposal file of the specified project',
        summary: 'Download project pitch proposal',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'integer',
              description: 'Project to download the pitch proposal file from'
            }
          }
        },
        response: {
          200: { type: 'string', description: 'Pitch proposal file stream' },
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
    handler: handlers.downloadProposal
  },

  updateProject: {
    method: 'put',
    path: `${basePath}/:projectId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Modifies the specified project information',
        summary: 'Update project information',
        params: {
          type: 'object',
          properties: {
            projectId: { type: 'number' }
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
                    faqLink: { type: 'string' },
                    status: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 3,
                      description: 'Status ID [0-3] to set the project as'
                    }
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
              projectName: { type: 'string' },
              mission: { type: 'string' },
              problemAddressed: { type: 'string' },
              location: { type: 'string' },
              timeframe: { type: 'string' },
              pitchProposal: { type: 'string' },
              faqLink: { type: 'string' },
              milestonesFile: { type: 'string' },
              goalAmount: { type: 'number' },
              status: { type: 'integer' },
              ownerId: { type: 'integer' },
              projectAgreement: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              transactionHash: { type: 'string' },
              creationTransactionHash: { type: 'string' },
              id: { type: 'integer' },
              startBlockchainStatus: { type: 'integer' },
              coverPhoto: { type: ['integer', 'null'] },
              cardPhoto: { type: ['integer', 'null'] },
              blockchainStatus: { type: 'integer' },
              ownerName: { type: 'string' },
              ownerEmail: { type: 'string' }
            },
            description:
              'Returns an object with the information of the updated project'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.updateProject
  },

  getProjectsByOracle: {
    method: 'get',
    path: `/oracles/:userId${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description:
          'Returns a list of all projects that the specified oracle has activities assigned to',
        summary: 'Get all projects of an oracle',
        params: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer',
              description: 'Oracle to get the projects from'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              projects: {
                type: 'array',
                items: { type: 'integer' }
              },
              oracle: { type: 'integer' }
            },
            description:
              'Returns an object with the oracle id and an array of their project ids'
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
    handler: handlers.getProjectsByOracle
  },

  uploadExperience: {
    method: 'post',
    path: `${basePath}/:projectId/experiences`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Uploads an experience to the specified project',
        summary: 'Upload experience to project',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'Project to upload the experience to'
            }
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
            },
            description:
              'Returns a success message if the experience was uploaded ' +
              'and an array of errors if any files failed'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.uploadExperience
  },

  getExperiences: {
    method: 'get',
    path: `${basePath}/:projectId/experiences`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns all the experiences of the specified project',
        summary: 'Get project experiences',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'Project to get the experiences from'
            }
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
            },
            description: "Returns an array of the project's experiences"
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getExperiences
  }
};

module.exports = routes;
