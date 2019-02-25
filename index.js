const configs = require("./config/configs");
const server = require("./src/rest/server");
const db = require("./db/db");

var logger = configs.logger;
var serverConfigs = configs.server


server.start({ db, logger, serverConfigs });
