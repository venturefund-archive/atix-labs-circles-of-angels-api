const basePath = "/user";


routes = async (fastify, options) => {
  fastify.get(
    `${basePath}/:id`,
    {
      schema: {
        params: {
          id: { type: "integer" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            response: { type: "object" }
          }
        }
      }
    },
    async (request, reply) => {
      const userDao = require('../dao/userDao')();
      fastify.log.info("[User Routes] :: Getting user info")
      const user = await userDao.getUserById({id : request.params.id});
      if (!user) reply.send({error: `Can not find user with id: ${request.params.id}`});

      reply.send({
        name: user.username,
        email: user.email,
        userid: user.userid
      });
    }
  )
};

module.exports = routes;
