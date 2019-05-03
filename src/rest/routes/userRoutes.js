const userDaoBuilder = require('../dao/userDao');
const userRegistrationStatusDaoBuilder = require('../dao/userRegistrationStatusDao');
const roleDaoBuilder = require('../dao/roleDao');

const basePath = '/user';
const userFunderDaoBuilder = require('../dao/userFunderDao');
const userSocialEntrepreneurDaoBuilder = require('../dao/userSocialEntrepreneurDao');

const routes = async (fastify, options) => {
  const userService = require('../core/userService')({
    fastify,
    userDao: userDaoBuilder({
      userModel: fastify.models.user
    }),
    userRegistrationStatusDao: userRegistrationStatusDaoBuilder(
      fastify.models.user_registration_status
    ),
    roleDao: roleDaoBuilder(fastify.models.role),
    userFunderDao: userFunderDaoBuilder(fastify.models.user_funder),
    userSocialEntrepreneurDao: userSocialEntrepreneurDaoBuilder(
      fastify.models.user_social_entrepreneur
    )
  });

  fastify.get(
    `${basePath}/:id`,
    {
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
      fastify.log.info('[User Routes] :: Getting all users');
      try {
        const users = await userService.getUsers();
        reply.status(200).send(users);
      } catch (error) {
        reply.status(500).send({ error });
      }
    }
  );

  fastify.get(
    `${basePath}/:userId/role`,
    {
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
          "[User Routes] :: There was an error getting the user's role:",
          error
        );
        reply.status(500).send({
          error: "There was an unexpected error getting the user's role"
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
      try {
        const { email, pwd } = request.body;

        fastify.log.info('[User Routes] :: Trying to log in user:', email);

        const user = await userService.login(email, pwd);

        if (user.error) {
          fastify.log.error('[User Routes] :: Log in failed for user:', email);
          reply.status(401).send({ error: user.error });
        } else {
          fastify.log.info(
            '[User Routes] :: Log in successful for user:',
            email
          );
          reply.status(200).send(user);
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
            detail: { type: 'object' }
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
      try {
        const { email, pwd, username, role, detail } = request.body;

        fastify.log.info('[User Routes] :: Creating new user:', request.body);
        const user = await userService.createUser(
          username,
          email,
          pwd,
          role,
          detail
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
};

module.exports = routes;
