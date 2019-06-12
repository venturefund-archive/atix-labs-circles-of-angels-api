const basePath = '/user';
const handlers = require('./handlers/userHandlers');

const routes = {
  getUser: {
    method: 'get',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns an object the information of an existing user',
        summary: 'Get existing user',
        params: {
          id: { type: 'integer' }
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
    handler: handlers.getUser
  },

  getUsers: {
    method: 'get',
    path: `${basePath}`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        description: 'Returns the information of all the existing COA users',
        summary: 'Get all existing users'
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
    handler: handlers.getUsers
  },

  getUserRole: {
    method: 'get',
    path: `${basePath}/:userId/role`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns the role of an existing user',
        summary: "Get user's role",
        params: {
          id: { type: 'integer' }
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
    handler: handlers.getUserRole
  },

  getRegistrationStatus: {
    method: 'get',
    path: `${basePath}/registrationStatus`,
    options: {
      schema: {
        description: 'Returns the registration status of an existing user',
        summary: 'Get user registration status',
        response: {
          200: {
            type: 'object',
            properties: {
              registrationStatus: {
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
    handler: handlers.getRegistrationStatus
  },

  getAllRoles: {
    method: 'get',
    path: `${basePath}/role`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
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
            }
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
        description: 'User login by email and password',
        summary: 'User login',
        type: 'application/json',
        body: {
          email: { type: 'string' },
          pwd: { type: 'string' }
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
    handler: handlers.loginUser
  },

  signupUser: {
    method: 'post',
    path: `${basePath}/signup`,
    options: {
      schema: {
        description: 'Registers a new user in COA',
        summary: 'User sign up',
        body: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            email: { type: 'string' },
            pwd: { type: 'string' },
            role: { type: 'number' },
            detail: { type: 'object' },
            questionnaire: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          },
          required: ['username', 'email', 'pwd', 'role']
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
    handler: handlers.signupUser
  },

  updateUser: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
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
          additionalProperties: false
        },
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
    handler: handlers.updateUser
  },

  getOracles: {
    method: 'get',
    path: `${basePath}/oracle`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns all existing COA Oracles',
        summary: 'Get all COA Oracles'
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
    handler: handlers.getOracles
  },

  recoverPassword: {
    method: 'post',
    path: `${basePath}/recoverPassword`,
    options: {
      schema: {
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
          required: ['email']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              email: { type: 'string' }
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
    handler: handlers.recoverPassword
  },

  updatePassword: {
    method: 'post',
    path: `${basePath}/updatePassword`,
    options: {
      schema: {
        description:
          'Modifies the password of an existing user validating the token sent by email',
        summary: 'Update user password',
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            password: { type: 'string' }
          },
          required: ['token', 'password']
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
    handler: handlers.updatePassword
  },

  getUserProjects: {
    method: 'get',
    path: `${basePath}/:id/projects`,
    options: {
      schema: {
        description: 'Returns all projects related to an existing user',
        summary: 'Get all projects by user'
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
    handler: handlers.getUserProjects
  }
};

module.exports = routes;
