const { transactionTypes, blockchainStatus } = require('../../util/constants');

const transactionCallbacks = logger => {
  const { helper } = require('../helper');
  const { projectDao, milestoneDao, activityDao } = helper.daos;

  return {
    projectCreation: async (hash, ids) => {
      const { projectId } = ids;
      if (!projectId) {
        logger.error(
          `[Transaction Callbacks] :: ${
            transactionTypes.projectCreation
          } must provide project id`
        );
        return;
      }
      await projectDao.updateCreationTransactionHash(projectId, hash);
      await projectDao.updateBlockchainStatus(projectId, blockchainStatus.SENT);
    },
    projectStarted: async (hash, ids) => {
      const { projectId } = ids;
      if (!projectId) {
        logger.error(
          `[Transaction Callbacks] :: ${
            transactionTypes.projectStarted
          } must provide project id`
        );
        return;
      }
      await projectDao.updateStartTransactionHash(projectId, hash);
      await projectDao.updateStartBlockchainStatus(
        projectId,
        blockchainStatus.SENT
      );
    },
    milestoneCreation: async (hash, ids) => {
      const { milestoneId } = ids;
      if (!milestoneId) {
        logger.error(
          `[Transaction Callbacks] :: ${
            transactionTypes.milestoneCreation
          } must provide milestone id`
        );
        return;
      }
      await milestoneDao.updateBlockchainStatus(
        milestoneId,
        blockchainStatus.SENT
      );
      await milestoneDao.updateCreationTransactionHash(milestoneId, hash);
    },
    activityCreation: async (hash, ids) => {
      const { activityId } = ids;
      if (!activityId) {
        logger.error(
          `[Transaction Callbacks] :: ${
            transactionTypes.activityCreation
          } must provide activity id`
        );
        return;
      }
      await activityDao.updateBlockchainStatus(
        activityId,
        blockchainStatus.SENT
      );
      await activityDao.updateCreationTransactionHash(activityId, hash);
    },
    milestoneClaimed: async (hash, ids) => {
      //no action performed
    },
    milestoneFunded: async (hash, ids) => {
      //no action performed
    },
    validateActivity: async (hash, ids) => {
      const { activityId } = ids;
      if (!activityId) {
        logger.error(
          `[Transaction Callbacks] :: ${
            transactionTypes.validateActivity
          } must provide activity id`
        );
        return;
      }
      await activityDao.updateTransactionHash(activityId, hash);
      await activityDao.updateBlockchainStatus(
        activityId,
        blockchainStatus.SENT
      );
    },
    updateEvidence: async (hash, ids) => {
      //no action performed
    }
  };
};

module.exports = transactionCallbacks;
