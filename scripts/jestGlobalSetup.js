const { exec, execSync } = require('child_process');
const { testConfig } = require('config');
const { runGSN } = require('./runDevGsn');
const logger = require('../src/rest/logger');

async function runNode() {
  exec('npm run node >> /dev/null');
  // Wait until buidler node is up and running
  execSync('sleep 5');
}

module.exports = async () => {
  logger.info('Running jest global setup');
  if (testConfig.ganache.runOnTest) {
    await runNode();
  }
  if (testConfig.relayer.runOnTest) {
    await runGSN();
  }
  logger.info('Jest global setup finished');
};
