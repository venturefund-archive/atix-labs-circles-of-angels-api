const configs = require('config');
const server = require('./src/rest/server');
const db = require('./db/db');
const logger = require('./src/rest/logger');

server.start({ db, logger, configs });
