exports.server = {
  host: 'localhost',
  port: 3001,
  headers: {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': [
      'Origin, X-Requested-With, Content-Type, Accept'
    ]
  }
};

const COAProjectAdmin = require('../../circle-of-angels-solidity/build/contracts/COAProjectAdmin.json');
const COAOracle = require('../../circle-of-angels-solidity/build/contracts/COAOracle.json');

exports.eth = {
  HOST: 'ws://localhost:8545',
  CONTRACT_ADMIN_ADDRESS: COAProjectAdmin.networks['5777'].address,
  CONTRACT_ORACLE_ADDRESS: COAOracle.networks['5777'].address,
  CONTRACT_ADMIN_ABI: COAProjectAdmin.abi,
  CONTRACT_ORACLE_ABI: COAOracle.abi,
  DEFAULT_CONFIG: {
    defaultGas: 50000,
    defaultGasPrice: 1000000
  },
  UNLOCK_DURATION: 10000,
  INITIAL_FUNDS: 10000000000000000
};

exports.support = {
  service: 'Gmail',
  email: 'circlesofangelshelp@gmail.com',
  password: 'coasupport1',
  recoveryTime: 1 //in hours
};

exports.jwt = {
  secret: 'atix2018'
};

exports.database = {
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
};

exports.fileServer = {
  filePath: '/home/atixlabs/files/server'
};

exports.swagger = {
  routePrefix: '/documentation',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Circles od Angels API',
      description: 'documentation of Circles of Angels API',
      version: '0.1.0'
    },
    host: this.server.host,
    schemes: ['http', 'json'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
};

const bunyan = require('bunyan');
const bformat = require('bunyan-format');

const formatOut = bformat({ outputMode: 'short' });

exports.logger = bunyan.createLogger({
  name: 'circles-of-angels-api',
  streams: [
    {
      level: 'info',
      stream: formatOut
    },
    {
      level: 'error',
      stream: formatOut
    },
    {
      level: 'info',
      path: './logs/logs.info',
      type: 'rotating-file',
      period: '1d',
      count: 5
    },
    {
      level: 'error',
      path: './logs/logs.error',
      type: 'rotating-file',
      period: '1d',
      count: 5
    },
    {
      level: 'fatal',
      path: './logs/logs.fatal',
      type: 'rotating-file',
      period: '1d',
      count: 5
    }
  ]
});
