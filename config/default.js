/**
 * AGPL LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  server: {
    host: 'localhost',
    port: 3001,
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': [
        'Origin, X-Requested-With, Content-Type, Accept'
      ]
    }
  },

  support: {
    service: 'Gmail',
    email: 'circlesofangelshelp@gmail.com',
    password: 'coasupport1',
    recoveryTime: 1 // in hours
  },

  jwt: {
    secret: 'atix2018'
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
    filePath: '/home/atixlabs/files/server'
  },

  swagger: {
    routePrefix: '/documentation',
    exposeRoute: true,
    swagger: {
      info: {
        title: 'Circles od Angels API',
        description: 'documentation of Circles of Angels API',
        version: '0.1.0'
      },
      host: 'localhost',
      schemes: ['http', 'json'],
      consumes: ['application/json'],
      produces: ['application/json']
    }
  }
};
