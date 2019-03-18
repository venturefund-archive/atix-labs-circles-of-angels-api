const basePath = '/user';

routes = async (fastify, options) => {
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
        userid: user.userid
      });
    }
  );
};

module.exports = routes;
