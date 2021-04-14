const { exec, execSync } = require('child_process');
const { testConfig } = require('config');
const { runGSN } = require('./runDevGsn');
const logger = require('../src/rest/logger');

async function runGanache() {
  exec('npm run ganache >> /dev/null');
  // Wait until ganache is up and running
  execSync('sleep 3');
}

module.exports = async () => {
  logger.info('Running jest global setup');
  if (testConfig.ganache.runOnTest) {
    await runGanache();
  }
  if (testConfig.relayer.runOnTest) {
    await runGSN();
  }
  logger.info('Jest global setup finished');
};
