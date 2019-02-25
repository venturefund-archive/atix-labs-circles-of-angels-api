// Require the framework and instantiate it

const swaggerConfigs = require("../../config/configs").swagger;

/**
 * @method start asynchronous start server -> initialice fastify, with database, plugins and routes
 * @param db instance of database creator.
 * @param logger instance of a logger that contains the pino interface
 * @param serverConfigs server configs for the connection. I.e -> {host: 'localhost', port: 3000}
 */
module.exports.start = async ({ db, logger, serverConfigs }) => {
  try {
    
    fastify = require("fastify")({ logger: logger });
    
    //Init DB
    try {
      await db.register(fastify);  // fastify.models works after run fastify.listen(...,...)
    } catch (e) {
      fastify.log.error("Cant connect to DB");
    }
    //Load Swagger
    fastify.register(require("fastify-swagger"), swaggerConfigs);

    //Load routes
    fastify.register(require("./routes/userRoutes"));
    fastify.register(require("./routes/generalRoutes").default);
    fastify.register(require("./routes/transferRoutes"));

    await fastify.listen(serverConfigs);
    
    module.exports.fastify = fastify
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

