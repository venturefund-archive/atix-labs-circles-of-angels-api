const configs = require('../../config/configs');
const ethService = require('./services/eth/ethServices');

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
    fastify.use(require('cors')());

    // Init DB
    try {
      await db.register(fastify); // fastify.models works after run fastify.listen(...,...)
    } catch (e) {
      fastify.log.error('Cant connect to DB');
    }

    // Load Swagger
    fastify.register(require('fastify-swagger'), swaggerConfigs);
    fastify.register(require('fastify-static'), { root: '/' });
    fastify.eth = ethService(configs.eth.host);

    loadRoutes(fastify);

    await fastify.listen(serverConfigs);
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
