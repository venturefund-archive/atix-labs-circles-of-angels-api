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
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');

const idParam = (description, param) => ({
  type: 'object',
  properties: {
    [param]: {
      type: 'integer',
      description
    }
  }
});

const userResponse = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    address: { type: 'string' },
    createdAt: { type: 'string' },
    id: { type: 'integer' },
    role: { type: 'string' },
    blocked: { type: 'boolean' }
  },
  description: "User's information"
};

const successWithMessageResponse = {
  type: 'object',
  properties: {
    success: { type: 'string' }
  },
  description: 'Returns a success message if the user was signed up correctly'
};

const successWithUserResponse = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: userResponse
    }
  },
  description: 'Returns an array of objects with the users information'
};

const projectResponse = {
  projectName: { type: 'string' },
  mission: { type: 'string' },
  problemAddressed: { type: 'string' },
  location: { type: 'string' },
  timeframe: { type: 'string' },
  proposal: { type: 'string' },
  faqLink: { type: 'string' },
  coverPhotoPath: { type: 'string' },
  cardPhotoPath: { type: 'string' },
  goalAmount: { type: 'number' },
  status: { type: 'string' },
  owner: { type: 'number' },
  createdAt: { type: 'string' },
  transactionHash: { type: 'string' },
  id: { type: 'number' }
};

const successWithProjectsResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: projectResponse
  },
  description: 'Returns an array of objects with the projects information'
};

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
          ...successResponse(successWithUserResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getUsers
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
          ...successResponse(userResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
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
          ...successResponse(successWithMessageResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.signupUser
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

  getMyProjects: {
    method: 'get',
    path: `${basePath}/me/projects`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all projects related to an existing user',
        summary: 'Get all projects by user',
        response: {
          ...successResponse(successWithProjectsResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getMyProjects
  },

  getFollowedProjects: {
    method: 'get',
    path: `${basePath}/followed-projects`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all projects followed to an existing user',
        summary: 'Get all followed projects by user',
        response: {
          ...successResponse(successWithProjectsResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getFollowedProjects
  },

  getAppliedProjects: {
    method: 'get',
    path: `${basePath}/applied-projects`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all projects applied of an existing user',
        summary: 'Get all applied projects by user',
        response: {
          ...successResponse(successWithProjectsResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getAppliedProjects
  }
};

module.exports = routes;
