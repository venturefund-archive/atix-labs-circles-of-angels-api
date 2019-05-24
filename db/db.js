const fastWater = require('fast-water');
/**
 * Register the actual db to a fastify instance
 * @method register
 * @param fastify fastify instance
 */
exports.register = async fastify => {
  fastify.register(fastWater, fastify.configs.database);
};
