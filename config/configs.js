exports.server = {
  host: "localhost",
  port: 3001
};

exports.database = {
  adapter: require("sails-postgresql"),
  adapterType: "postgresql",
  database: {
    name: "coadb",
    user: "atixlabs",
    password: "atix2018",
    host: "localhost",
    port: "5432"
  },
  decoratorName: "models",
  modelPath: require("path").join(__dirname, "../db/models"),
  modelDefaults: {
    datastore: "default",
    fetchRecordsOnCreate: true,
    fetchRecordsOnUpdate: true,
  }
};

exports.swagger = {
  routePrefix: "/documentation",
  exposeRoute: true,
  swagger: {
    info: {
      title: "Circles od Angels API",
      description: "documentation of Circles of Angels API",
      version: "0.1.0"
    },
    host: this.server.host,
    schemes: ["http", "json"],
    consumes: ["application/json"],
    produces: ["application/json"]
  }
};

const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const formatOut = bformat({ outputMode: 'short' });

exports.logger = bunyan.createLogger({
  name: "circles-of-angels-api",
  streams: [
    {
      level: "info",
      stream: formatOut
    },
    {
      level: "error",
      stream: formatOut
    },
    {
      level: "info",
      path: "./logs/logs.info",
      type: "rotating-file",
      period: "1d",
      count: 5
    },
    {
      level: "error",
      path: "./logs/logs.error",
      type: "rotating-file",
      period: "1d",
      count: 5
    },
    {
      level: "fatal",
      path: "./logs/logs.fatal",
      type: "rotating-file",
      period: "1d",
      count: 5
    }
  ]
});
