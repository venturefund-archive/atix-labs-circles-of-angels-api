const { exec } = require('child_process');
const { testConfig } = require('config');
const { runGSN } = require('./runDevGsn');
const logger = require('../src/rest/logger');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runGanache() {
  exec('npm run ganache >> /dev/null');
  await sleep(2000);
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
