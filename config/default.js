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
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT,
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': [
        'Origin, X-Requested-With, Content-Type, Accept'
      ]
    },
    isHttps: false,
    domain: 'localhost'
  },
  frontendUrl: process.env.FRONTEND_URL,
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    apiKey: process.env.EMAIL_API_KEY, // sendgrid apikey, when undefined uses smtp
    from: process.env.EMAIL_FROM,
    disabled: process.env.EMAIL_DISABLED === 'true'
  },

  support: {
    recoveryTime: process.env.SUPPORT_RECOVERY_TIME // in hours
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRATION_TIME // in months
  },

  database: {
    adapter: require('sails-postgresql'),
    adapterType: 'postgresql',
    database: {
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
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
    filePath: process.env.FILE_SERVER_PATH,
    maxFileSize: process.env.FILE_SERVER_MAX_FILE_SIZE
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
    },
    checkFailedTransactionsJob: {
      cronTime: cronExpressions.EVERY_HOUR,
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
    defaultNetwork: 'develop',
    mainnet_url: process.env.MAINNET_URL || '',
    mainnet_account: process.env.MAINNET_ACCOUNT || '',
    testnet_url: process.env.TESTNET_URL || '',
    testnet_account: process.env.TESTNET_ACCOUNT || ''
  },
  explorerLink: 'https://explorer.testnet.rsk.co',
  crypto: {
    key: process.env.CRYPTO_KEY,
    nonce: process.env.CRYPTO_NONCE
  }
};
