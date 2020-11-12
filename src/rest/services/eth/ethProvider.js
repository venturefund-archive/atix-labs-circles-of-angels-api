const logger = require('../../logger');
const transferService = require('../../services/transferService');
const activityService = require('../../services/activityService');

const ethProvider = async blockNumber => {
  logger.info(`[ethProvider] :: block ${blockNumber}`);
  (async () => {
    await transferService.updateVerifiedTransferTransactions(blockNumber);
    await activityService.updateVerifiedEvidenceTransactions(blockNumber);
  })();
};

module.exports = {
  ethProvider
};
