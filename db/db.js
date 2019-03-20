const fastWater = require('fast-water');
const configs = require('../config/configs').database;
/**
 * Register the actual db to a fastify instance
 * @method register
 * @param fastify fastify instance
 */
exports.register = async fastify => {
  fastify.register(fastWater, configs);
};
