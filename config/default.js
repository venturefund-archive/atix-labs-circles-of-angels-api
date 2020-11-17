/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const routeTags = require('../src/rest/util/routeTags');
const cronExpressions = require('../src/rest/services/cronjob/cronExpressions');

const SECONDS_IN_A_DAY = 86400;

require('dotenv').config();

module.exports = {
  server: {
    host: 'localhost',
    port: 3001,
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': [
        'Origin, X-Requested-With, Content-Type, Accept'
      ]
    },
    isHttps: false,
    domain: 'localhost'
  },
  frontendUrl: 'http://localhost:3000',
  support: {
    service: 'Gmail',
    email: 'circlesofangelshelp@gmail.com',
    password: 'coasupport1',
    recoveryTime: 1 // in hours
  },

  jwt: {
    secret: 'atix2018',
    expirationTime: 3 // in months
  },

  database: {
    adapter: require('sails-postgresql'),
    adapterType: 'postgresql',
    database: {
      name: 'coadb',
      user: 'atixlabs',
      password: 'atix2018',
      host: 'localhost',
      port: '5432'
    },
    decoratorName: 'models',
    modelPath: require('path').join(__dirname, '../db/models'),
    modelDefaults: {
      datastore: 'default',
      fetchRecordsOnCreate: true,
      fetchRecordsOnUpdate: true
    }
  },

  fileServer: {
    filePath: '/home/atixlabs/files/server/files'
  },

  swagger: {
    routePrefix: '/documentation',
    exposeRoute: true,
    swagger: {
      info: {
        title: 'Circles of Angels API',
        description: 'Circles of Angels API Documentation',
        version: '0.1.0'
      },
      host: 'localhost:3001',
      schemes: ['http', 'json'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: Object.values(routeTags)
    }
  },

  crons: {
    disableAll: false,
    transitionProjectStatusJob: {
      cronTime: cronExpressions.EVERYDAY_AT_MIDNIGHT,
      disabled: false,
      runOnInit: false,
      timezone: undefined
    }
  },

  defaultProjectTimes: {
    minimumUnit: 'days',
    consensusSeconds: 10 * SECONDS_IN_A_DAY, // TODO: define this
    fundingSeconds: 10 * SECONDS_IN_A_DAY // TODO: define this
  },

  buidler: {
    defaultNetwork: 'develop'
  }
};
