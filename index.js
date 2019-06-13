/**
 * AGPL LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const configs = require('config');
const server = require('./src/rest/server');
const db = require('./db/db');
const logger = require('./src/rest/logger');

server.start({ db, logger, configs });
