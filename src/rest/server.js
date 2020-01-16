/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing
 * smart contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa, ethers, ethereum } = require('@nomiclabs/buidler');
const COAError = require('./errors/COAError');

/**
 * @method start asynchronous start server -> initialice fastify, with database, plugins and routes
 * @param db instance of database creator.
 * @param logger instance of a logger that contains the pino interface
 * @param serverConfigs server configs for the connection. I.e -> {host: 'localhost', port: 3000}
 */

// TODO : this should handle the txs that reverted.
// TODO : move this to another file.
process.on('unhandledRejection', (reason, p) => {
  const { data, message, code } = reason;
  if (message === 'VM Exception while processing transaction: revert') {
    const txs = Object.keys(data).filter(k => !['stack', 'name'].includes(k));
    console.log('failed txs', txs);
  }
});

ethers.provider.on('block', blockNumber => console.log('block', blockNumber));

module.exports.start = async ({ db, logger, configs }) => {
  await coa.success();
  coa.fail();
  coa.emitEvent();
  coa.emitEvent();
  coa.fail();

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

    // fastify.eth = await ethInitializer({ logger });
    fastify.setErrorHandler((error, request, reply) => {
      if (error instanceof COAError) {
        reply.status(error.statusCode).send(error.message);
      } else {
        reply.status(500).send('Internal Server Error');
      }
    });
    loadRoutes(fastify);

    await fastify.listen(configs.server);
    // start service initialization, load and inject dependencies
    require('./ioc')(fastify);
    // await helperBuilder(fastify);
    // await fastify.eth.initListener();
    // await fastify.eth.listener.startListen();
    module.exports.fastify = fastify;
  } catch (err) {
    // TODO add logger
    console.log('error', err);
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

    // TODO : this should be somewhere else.
    const validateUser = async (token, reply, roleId) => {
      const user = await fastify.jwt.verify(token);
      const userService = require('./services/userService');
      const validUser = await userService.validUser(user, roleId);
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
        if (token) await validateUser(token, reply, userRoles.COA_ADMIN);
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
