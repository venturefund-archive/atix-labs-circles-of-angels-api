/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/users';
const handlers = require('./handlers/userHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  getUser: {
    method: 'get',
    path: `${basePath}/:userId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns an object the information of an existing user',
        summary: 'Get existing user',
        params: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer',
              description: 'User to get the information'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              address: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              id: { type: 'integer' },
              role: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' }
                }
              },
              registrationStatus: { type: 'integer' }
            },
            description: 'Returns and object with the user information'
          },
          '4xx': {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getUser
  },

  getUsers: {
    method: 'get',
    path: `${basePath}`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns the information of all the existing COA users',
        summary: 'Get all existing users',
        response: {
          200: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    address: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    id: { type: 'integer' },
                    role: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' }
                      }
                    },
                    registrationStatus: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' }
                      }
                    },
                    answers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          customAnswer: { type: 'string' },
                          id: { type: 'integer' },
                          question: {
                            type: 'object',
                            properties: {
                              question: { type: 'string' },
                              role: { type: 'integer' },
                              answerLimit: { type: 'integer' },
                              id: { type: 'integer' }
                            }
                          },
                          answer: {
                            type: 'object',
                            properties: {
                              answer: { type: 'string' },
                              id: { type: 'integer' },
                              question: { type: 'integer' }
                            }
                          },
                          user: { type: 'integer' }
                        }
                      }
                    },
                    detail: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        phoneNumber: { type: ['string', 'null'] },
                        company: { type: ['string', 'null'] },
                        user: { type: 'integer' }
                      }
                    }
                  },
                  description: 'Information of an individual user'
                }
              }
            },
            description:
              'Returns an array of objects with the users information'
          },
          '4xx': {
            type: 'object',
            properties: {
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
    handler: handlers.getUsers
  },

  getUserRole: {
    method: 'get',
    path: `${basePath}/:userId/role`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns the role of an existing user',
        summary: "Get user's role",
        params: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer',
              description: 'User to get the role from'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' }
            },
            description: 'Returns an object with the role of the user'
          },
          '4xx': {
            type: 'object',
            properties: {
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
    handler: handlers.getUserRole
  },

  getAllRoles: {
    method: 'get',
    path: `${basePath}/roles`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all available user roles in COA',
        summary: 'Get all user roles',
        response: {
          200: {
            type: 'object',
            properties: {
              roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' }
                  }
                }
              }
            },
            description:
              'Returns an array of objects with each available user roles'
          },
          '4xx': {
            type: 'object',
            properties: {
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
    handler: handlers.getAllRoles
  },

  loginUser: {
    method: 'post',
    path: `${basePath}/login`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description: 'User login by email and password',
        summary: 'User login',
        type: 'application/json',
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            pwd: { type: 'string' }
          },
          required: ['email', 'pwd'],
          additionalProperties: false,
          description: 'User login information'
        },
        response: {
          200: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              id: { type: 'integer' },
              role: { type: 'string' }
            },
            description:
              'Returns an object with the information of the logged in user ' +
              'and sets an http-only cookie with JWT'
          },
          '4xx': {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  status: { type: 'integer' },
                  error: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      username: { type: 'string' },
                      email: { type: 'string' },
                      id: { type: 'integer' },
                      role: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          name: { type: 'string' }
                        }
                      },
                      registrationStatus: { type: 'integer' }
                    }
                  }
                }
              }
            },
            description: 'Returns an object describing the error'
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
    handler: handlers.loginUser
  },

  signupUser: {
    method: 'post',
    path: `${basePath}/signup`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description: 'Registers a new user in COA',
        summary: 'User sign up',
        body: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string' },
            detail: { type: 'object' },
            questionnaire: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          },
          required: ['firstName', 'lastName', 'email', 'password', 'role'],
          description: 'User on-boarding information'
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            },
            description:
              'Returns a success message if the user was signed up correctly'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            response: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            response: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.signupUser
  },

  updateUser: {
    method: 'put',
    path: `${basePath}/:userId`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.PUT.name],
        description: 'Modifies an existing user information',
        summary: 'Update COA user',
        body: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            email: { type: 'string' },
            pwd: { type: 'string' },
            registrationStatus: { type: 'number' }
          },
          additionalProperties: false,
          description: 'Fields to modify'
        },
        params: {
          type: 'object',
          properties: {
            userId: { type: 'number', description: 'User to modify' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            },
            description: 'Returns a success message if the user was updated'
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
    handler: handlers.updateUser
  },

  getOracles: {
    method: 'get',
    path: `${basePath}/oracles`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all existing COA Oracles',
        summary: 'Get all COA Oracles',
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                email: { type: 'string' },
                address: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                id: { type: 'integer' },
                role: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' }
                  }
                },
                registrationStatus: { type: 'integer' }
              }
            },
            description:
              'Returns an array of objects with each oracle and their information'
          },
          '4xx': {
            type: 'object',
            properties: {
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
    handler: handlers.getOracles
  },

  recoverPassword: {
    method: 'post',
    path: `${basePath}/recoverPassword`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description:
          'Receives an email account and starts the password recovery process ' +
          'for the corresponding user, sending them an email with the instructions ' +
          'on how to proceed',
        summary: 'Start password recovery process',
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' }
          },
          required: ['email'],
          description: 'E-mail account of the user to recover the password'
        },
        response: {
          200: {
            type: 'object',
            properties: {
              email: { type: 'string' }
            },
            description:
              'Returns the email account of the user if the mail has been sent'
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
    handler: handlers.recoverPassword
  },

  updatePassword: {
    method: 'put',
    path: `${basePath}/password`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.PUT.name],
        description:
          'Modifies the password of an existing user validating the token sent by email',
        summary: 'Update user password',
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            password: { type: 'string' }
          },
          required: ['token', 'password'],
          description: 'New password and validation token'
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            },
            description: 'Returns a success message if the password was changed'
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
    handler: handlers.updatePassword
  },

  getUserProjects: {
    method: 'get',
    path: `${basePath}/:userId/projects`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all projects related to an existing user',
        summary: 'Get all projects by user',
        params: {
          type: 'object',
          properties: {
            userId: { type: 'integer' }
          },
          description: 'User to get their projects from'
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
            description:
              'Returns an array of objects with the information of each project'
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
    handler: handlers.getUserProjects
  }
};

module.exports = routes;
