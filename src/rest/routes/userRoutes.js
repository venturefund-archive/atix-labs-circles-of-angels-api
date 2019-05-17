const basePath = '/user';
const apiHelper = require('../services/helper');

const routes = async (fastify, options) => {
  fastify.get(
    `${basePath}/:id`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      fastify.log.info('[User Routes] :: Getting user info');
      const user = await userService.getUserById(request.params.id);
      if (!user)
        reply.send({
          error: `Cannot find user with id: ${request.params.id}`
        });

      reply.send(user);
    }
  );

  fastify.get(
    `${basePath}`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      fastify.log.info('[User Routes] :: Getting all users');
      try {
        const users = await userService.getUsers();
        reply.status(200).send({ users });
      } catch (error) {
        fastify.log.error(
          '[User Routes] :: There was an error getting all users:',
          error
        );
        reply.status(500).send({
          error: 'There was an unexpected error getting all users'
        });
      }
    }
  );

  fastify.get(
    `${basePath}/:userId/role`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      try {
        fastify.log.info('[User Routes] :: Getting user role');
        const role = await userService.getUserRole(request.params.userId);

        if (!role.error) {
          fastify.log.info('[User Routes] :: Role found: ', role);
          reply.status(200).send(role);
        } else {
          fastify.log.info(
            '[User Routes] :: Error getting user role: ',
            role.error
          );
          reply.status(404).send(role.error);
        }
      } catch (error) {
        fastify.log.error(
          '[User Routes] :: There was an error getting the user´s role:',
          error
        );
        reply.status(500).send({
          error: 'There was an unexpected error getting the user´s role'
        });
      }
    }
  );

  fastify.get(
    `${basePath}/registrationStatus`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      try {
        fastify.log.info(
          `[User Routes] :: GET request at ${basePath}/registrationStatus`
        );

        const registrationStatus = await userService.getAllRegistrationStatus();
        reply.status(200).send({ registrationStatus });
      } catch (error) {
        fastify.log.error(
          '[User Routes] :: There was an error getting all user registration status:',
          error
        );
        reply.status(500).send({
          error:
            'There was an unexpected error getting all user registration status'
        });
      }
    }
  );

  fastify.get(
    `${basePath}/role`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      try {
        fastify.log.info(`[User Routes] :: GET request at ${basePath}/role`);

        const roles = await userService.getAllRoles();
        reply.status(200).send({ roles });
      } catch (error) {
        fastify.log.error(
          '[User Routes] :: There was an error getting all user roles:',
          error
        );
        reply.status(500).send({
          error: 'There was an unexpected error getting all user roles'
        });
      }
    }
  );

  fastify.post(
    `${basePath}/login`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      try {
        const { email, pwd } = request.body;
        fastify.log.info('[User Routes] :: Trying to log in user:', email);

        const user = await userService.login(email, pwd);

        if (user.error) {
          fastify.log.error('[User Routes] :: Log in failed for user:', email);
          reply.status(401).send({ error: user });
        } else {
          fastify.log.info(
            '[User Routes] :: Log in successful for user:',
            email
          );
          const token = fastify.jwt.sign(user);

          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 1);
          reply
            .status(200)
            .setCookie('userAuth', token, {
              domain: 'localhost',
              path: '/',
              httpOnly: true,
              expires: expirationDate
              // secure: true
            })
            .send(user);
        }
      } catch (err) {
        reply
          .status(500)
          .send({ error: 'There was an unexpected error logging in' });
      }
    }
  );

  fastify.post(
    `${basePath}/signup`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      try {
        const {
          email,
          pwd,
          username,
          role,
          detail,
          questionnaire
        } = request.body;

        fastify.log.info('[User Routes] :: Creating new user:', request.body);
        const user = await userService.createUser(
          username,
          email,
          pwd,
          role,
          detail,
          questionnaire
        );

        if (user.error) {
          fastify.log.error('[User Routes] :: User creation failed', user);
          reply.status(user.status).send(user);
        } else {
          fastify.log.info('[User Routes] :: Creation successful:', user);
          reply.status(200).send({ success: 'User successfully created!' });
        }
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error creating user' });
      }
    }
  );

  fastify.put(
    `${basePath}/:id`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      const { id } = request.params;
      fastify.log.info(`PUT request at ${basePath}/${id}`, request.body);
      try {
        const { body } = request;

        const updatedUser = await userService.updateUser(id, body);

        if (updatedUser.error) {
          fastify.log.error('[User Routes] :: User update failed', updatedUser);
          reply.status(updatedUser.status).send(updatedUser);
        } else {
          fastify.log.info('[User Routes] :: Update successful:', updatedUser);
          reply.status(200).send({ success: 'User successfully updated!' });
        }
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error updating user' });
      }
    }
  );

  fastify.get(
    `${basePath}/oracle`,
    {
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
    async (request, reply) => {
      const { userService } = apiHelper.helper.services;
      fastify.log.info('[User Routes] :: getting list of oracles');
      try {
        const oracles = await userService.getOracles();
        reply.status(200).send(oracles);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error getting oracles' });
      }
    }
  );

  fastify.post(
    `${basePath}/recoverPassword`,
    {
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
    async (request, reply) => {
      try {
        const { passRecoveryService } = apiHelper.helper.services;
        fastify.log.info('[User Routes] :: Starting pass recovery proccess');
        const { email } = request.body;
        const response = await passRecoveryService.startPassRecoveryProcess(
          email
        );
        if (response.error) {
          fastify.log.error(
            '[User Routes] :: Recovery password procces failed',
            response
          );
          reply.status(response.status).send(response);
        } else {
          fastify.log.info(
            '[User Routes] :: Recovery password procces started successfully',
            response
          );
          reply.status(200).send(response);
        }
      } catch (error) {
        fastify.log.error(error);
        reply
          .status(500)
          .send({ error: 'Error Starting recovery password proccess' });
      }
    }
  );

  fastify.post(
    `${basePath}/updatePassword`,
    {
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
    async (request, reply) => {
      try {
        const { passRecoveryService } = apiHelper.helper.services;
        fastify.log.info('[User Routes] :: Updating password');
        const { token, password } = request.body;
        const response = await passRecoveryService.updatePassword(
          token,
          password
        );
        if (response.error) {
          fastify.log.error(
            '[User Routes] :: Update password failed',
            response
          );
          reply.status(response.status).send(response);
        } else {
          fastify.log.info(
            '[User Routes] :: Password updated successfully',
            response
          );
          reply.status(200).send({ success: 'Password updated successfully' });
        }
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error updating password' });
      }
    }
  );

  fastify.get(
    `${basePath}/:id/projects`,
    {
      response: {
        200: {
          type: 'application/json',
          properties: {
            response: { type: 'application/json' }
          }
        }
      }
    },
    async (request, reply) => {
      const {
        userService,
        userProjectService,
        projectService
      } = apiHelper.helper.services;
      const { id } = request.params;
      fastify.log.info('[User Routes] :: getting list of oracles');
      try {
        const projects = await userService.getProjectsOfUser(
          id,
          userProjectService,
          projectService
        );
        if (projects.error) {
          reply.status(projects.status).send(projects.error);
        } else {
          reply.status(200).send(projects);
        }
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error getting oracles' });
      }
    }
  );
};

module.exports = routes;
