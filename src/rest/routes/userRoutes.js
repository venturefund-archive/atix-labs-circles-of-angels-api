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
      const user = await userService.getUserById({ id: request.params.id });
      if (!user)
        reply.send({
          error: `Can not find user with id: ${request.params.id}`
        });

      reply.send({
        name: user.username,
        email: user.email,
        userid: user.id
      });
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
      const { email, pwd } = request.body;

      fastify.log.info('[User Routes] :: Trying to log in user:', email);

      const user = await userService.login(email, pwd);

      if (user.error) {
        fastify.log.error('[User Routes] :: Log in failed for user:', email);
        reply.status(401).send(user.error);
      } else {
        fastify.log.info('[User Routes] :: Log in successful for user:', email);
        reply.status(200).send(user);
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
      const { email, pwd, username } = request.body;

      fastify.log.info('[User Routes] :: Creating new user:', request.body);

      const user = await userService.createUser(username, email, pwd);

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
};

module.exports = routes;
