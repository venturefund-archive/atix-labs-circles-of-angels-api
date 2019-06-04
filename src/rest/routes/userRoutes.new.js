const basePath = '/user';
const handlers = require('./handlers/userHandlers');

const routes = async (fastify, options) => ({
  getUser: {
    method: 'get',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.getUser(fastify)
  },

  getUsers: {
    method: 'get',
    path: `${basePath}`,
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
    handler: handlers.getUsers(fastify)
  },

  getUserRole: {
    method: 'get',
    path: `${basePath}/:userId/role`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.getUserRole(fastify)
  },

  getRegistrationStatus: {
    method: 'get',
    path: `${basePath}/registrationStatus`,
    options: {
      schema: {
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
    handler: handlers.getRegistrationStatus(fastify)
  },

  getAllRoles: {
    method: 'get',
    path: `${basePath}/role`,
    options: {
      beforeHandler: [fastify.generalAuth],
      schema: {
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
    handler: handlers.getAllRoles(fastify)
  },

  loginUser: {
    method: 'post',
    path: `${basePath}/login`,
    options: {
      schema: {
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
    handler: handlers.loginUser(fastify)
  },

  signupUser: {
    method: 'post',
    path: `${basePath}/signup`,
    options: {
      schema: {
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
    handler: handlers.signupUser(fastify)
  },

  updateUser: {
    method: 'put',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: [fastify.adminAuth],
      schema: {
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
    handler: handlers.updateUser(fastify)
  },

  getOracles: {
    method: 'get',
    path: `${basePath}/oracle`,
    options: {
      beforeHandler: [fastify.generalAuth],
      response: {
        200: {
          type: 'application/json',
          properties: {
            response: { type: 'application/json' }
          }
        }
      }
    },
    handler: handlers.getOracles(fastify)
  },

  recoverPassword: {
    method: 'post',
    path: `${basePath}/recoverPassword`,
    options: {
      schema: {
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
    handler: handlers.recoverPassword(fastify)
  },

  updatePassword: {
    method: 'post',
    path: `${basePath}/updatePassword`,
    options: {
      schema: {
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
    handler: handlers.updatePassword(fastify)
  },

  getUserProjects: {
    method: 'get',
    path: `${basePath}/:id/projects`,
    options: {
      response: {
        200: {
          type: 'application/json',
          properties: {
            response: { type: 'application/json' }
          }
        }
      }
    },
    handler: handlers.getUserProjects(fastify)
  }
});

module.exports = routes;
