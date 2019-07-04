/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { helperBuilder } = require('./services/helper');
const ethInitializer = require('./services/eth/ethInitializer');

/**
 * @method start asynchronous start server -> initialice fastify, with database, plugins and routes
 * @param db instance of database creator.
 * @param logger instance of a logger that contains the pino interface
 * @param serverConfigs server configs for the connection. I.e -> {host: 'localhost', port: 3000}
 */
module.exports.start = async ({ db, logger, configs }) => {
  try {
    const swaggerConfigs = configs.swagger;
    const fastify = require('fastify')({ logger });
    fastify.register(require('fastify-cors'), {
      credentials: true,

      allowedHeaders: ['content-type'],

      origin: true
    });

    fastify.register(require('fastify-cookie'));
    fastify.configs = configs;
    fastify.register(require('fastify-file-upload'));
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

    fastify.eth = await ethInitializer({ logger });
    loadRoutes(fastify);

    await fastify.listen(configs.server);
    await helperBuilder(fastify);
    await fastify.eth.initListener();
    await fastify.eth.listener.startListen();
    module.exports.fastify = fastify;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const loadRoutes = fastify => {
  const fs = require('fs');
  const routesDir = `${__dirname}/routes`;
  const dirents = fs.readdirSync(routesDir, { withFileTypes: true });
  const routeNames = dirents
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name);
  const routes = routeNames.map(route => require(`${routesDir}/${route}`));

  routes.forEach(route =>
    Object.values(route).forEach(async ({ method, path, options, handler }) => {
      fastify.register(async () => {
        const routeOptions = { ...options };
        if (options.beforeHandler) {
          const decorators = options.beforeHandler.map(
            decorator => fastify[decorator]
          );
          routeOptions.beforeHandler = decorators;
        }

        fastify.route({
          method: method.toUpperCase(),
          url: path,
          ...routeOptions,
          handler: handler(fastify)
        });
      });
    })
  );
};

const initJWT = fastify => {
  const fp = require('fastify-plugin');
  const { userRoles } = require('./util/constants');
  const jwtPlugin = fp(async () => {
    fastify.register(require('fastify-jwt'), {
      secret: fastify.configs.jwt.secret
    });

    const getToken = (request, reply) => {
      const token = request.cookies.userAuth;
      if (!token) {
        fastify.log.error('[Server] :: No token received for authentication');
        reply
          .status(401)
          .send({ error: 'Only registered users, please login' });
      }
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
        fastify.log.error('[Server] :: Unathorized access for user:', user);
        reply.status(401).send({ error: 'Unauthorized access' });
      }
    };

    fastify.decorate('generalAuth', async (request, reply) => {
      try {
        const token = getToken(request, reply);
        fastify.log.info('[Server] :: General JWT Authentication', token);
        if (token) await validateUser(token, reply);
      } catch (err) {
        fastify.log.error('[Server] :: There was an error authenticating', err);
        reply.status(500).send({ error: 'There was an error authenticating' });
      }
    });
    fastify.decorate('adminAuth', async (request, reply) => {
      try {
        const token = getToken(request, reply);
        fastify.log.info('[Server] :: Admin JWT Authentication', token);
        if (token) await validateUser(token, reply, userRoles.BO_ADMIN);
      } catch (error) {
        fastify.log.error(
          '[Server] :: There was an error authenticating',
          error
        );
        reply.status(500).send({ error: 'There was an error authenticating' });
      }
    });
    fastify.decorate('withUser', async (request, reply) => {
      try {
        const token = getToken(request, reply);
        if (token) request.user = await fastify.jwt.verify(token);
      } catch (error) {
        fastify.log.error(
          '[Server] :: There was an error authenticating',
          error
        );
        reply.status(500).send({ error: 'There was an error authenticating' });
      }
    });
  });
  fastify.register(jwtPlugin);
};
