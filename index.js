const configs = require('./config/configs')(
  process.env.NODE_ENV || 'development'
);
const server = require('./src/rest/server');
const db = require('./db/db');

const { logger } = configs;
// var serverConfigs = configs.server;

server.start({ db, logger, configs });
