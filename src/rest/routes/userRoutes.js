const basePath = '/user';

const routes = async (fastify, options) => {
  const userDao = require('../dao/userDao')({
    userModel: fastify.models.user
  });
  const userService = require('../core/userService')({
    fastify,
    userDao
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
          // eslint-disable-next-line prettier/prettier
          '[User Routes] :: There was an error getting the user\'s role:',
          error
        );
        reply
          .status(500)
          // eslint-disable-next-line prettier/prettier
          .send({ error: 'There was an unexpected error getting the user\'s role' });
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
    `${basePath}/register`,
    {
      schema: {
        type: 'application/json',
        body: {
          username: { type: 'string' },
          email: { type: 'string' },
          pwd: { type: 'string' },
          role: { type: 'number' }
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
      const { email, pwd, username, role } = request.body;

      fastify.log.info('[User Routes] :: Creating new user:', request.body);

      const user = await userService.createUser(username, email, pwd, role);

      if (user.error) {
        fastify.log.error(
          '[User Routes] :: Creation failed for user:',
          request.body
        );
        reply.status(409).send(user.error);
      } else {
        fastify.log.info('[User Routes] :: Creation successful:', user);
        reply.status(200).send(user);
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
