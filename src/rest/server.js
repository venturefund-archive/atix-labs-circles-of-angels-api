const configs = require('../../config/configs');
const ethService = require('./services/eth/ethServices');
const { helperBuilder } = require('./services/helper');

const swaggerConfigs = configs.swagger;

/**
 * @method start asynchronous start server -> initialice fastify, with database, plugins and routes
 * @param db instance of database creator.
 * @param logger instance of a logger that contains the pino interface
 * @param serverConfigs server configs for the connection. I.e -> {host: 'localhost', port: 3000}
 */
module.exports.start = async ({ db, logger, serverConfigs }) => {
  try {
    const fastify = require('fastify')({ logger });
    fastify.register(require('fastify-cors'), {
      credentials: true,

      allowedHeaders: ['content-type'],

      origin: 'http://localhost:3000'
    });

    fastify.register(require('fastify-cookie'));
    initJWT(fastify);
    // Init DB
    try {
      await db.register(fastify); // fastify.models works after run fastify.listen(...,...)
    } catch (e) {
      fastify.log.error('Cant connect to DB');
    }

    // Load Swagger
    fastify.register(require('fastify-swagger'), swaggerConfigs);
    fastify.register(require('fastify-static'), { root: '/' });

    fastify.eth = await ethService(configs.eth.HOST, { logger });

    loadRoutes(fastify);

    await fastify.listen(serverConfigs);
    await helperBuilder(fastify);
    module.exports.fastify = fastify;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const loadRoutes = fastify => {
  const fs = require('fs');
  const routesDir = `${__dirname}/routes`;
  const routes = fs.readdirSync(routesDir);
  routes.forEach(route => fastify.register(require(`${routesDir}/${route}`)));
};

const initJWT = fastify => {
  const fp = require('fastify-plugin');
  const { userRoles } = require('./util/constants');
  const jwtPlugin = fp(async () => {
    fastify.register(require('fastify-jwt'), {
      secret: configs.jwt.secret
    });

    const getToken = (request, reply) => {
      const token = request.cookies.userAuth;
      if (!token)
        reply
          .status(401)
          .send({ error: 'Only registered users, please login' });
      return token;
    };

    const validateUser = async (token, reply, roleId) => {
      const { helper } = require('./services/helper');
      const user = await fastify.jwt.verify(token);
      const validUser = await helper.services.userService.validUser(
        user,
        roleId
      );
      if (!validUser) {
        reply.status(401).send({ error: 'Unauthorized user' });
      }
    };

    fastify.decorate('generalAuth', async (request, reply) => {
      try {
        fastify.log.info('authentication with JWT');
        const token = getToken(request, reply);
        if (token) await validateUser(token, reply);
      } catch (err) {
        reply.send(err);
      }
    });
    fastify.decorate('adminAuth', async (request, reply) => {
      try {
        fastify.log.info('authentication with JWT');
        const token = getToken(request, reply);
        if (token) await validateUser(token, reply, userRoles.BO_ADMIN);
      } catch (error) {
        reply.send(error);
      }
    });
  });
  fastify.register(jwtPlugin);
};
