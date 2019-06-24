/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const ethConfig = require('config').eth;
const workerBuilder = require('./ethWorker');

/**
 * Init a ethereum services, receiving the provider host and returns and object
 * @param {string} providerHost
 */
const ethServices = async (
  web3,
  { COAProjectAdmin, COAOracle },
  { logger }
) => {
  const worker = await workerBuilder(web3, {
    maxTransactionsPerAccount: 4,
    logger
  });

  const unlockAccount = async (account, pwd) => {
    await web3.eth.personal.unlockAccount(
      account,
      pwd,
      ethConfig.UNLOCK_DURATION
    );
  };

  const lockAccount = async account => {
    await web3.eth.personal.lockAccount(account);
  };

  const toBytes64Array = array => {
    array = array.map(row =>
      row.split('').map(c => web3.utils.asciiToHex(c).slice(0, 4))
    );
    return array;
  };

  const toStringArray = array => {
    array = array.map(row => row.map(c => web3.utils.toAscii(c)).join(''));
    return array;
  };

  const toChecksum = address => web3.utils.toChecksumAddress(address);

  const transfer = async (sender, receiver, value) => {
    return new Promise((resolve, reject) => {
      web3.eth.sendTransaction(
        {
          from: sender,
          to: receiver,
          value
        },
        (err, recipt) => {
          if (err) {
            logger.error(err);
            reject(err);
          }
          logger.info(`TxHash: ${recipt}`);
          resolve(recipt);
        }
      );
    });
  };

  return {
    async createAccount(pwd) {
      const account = await web3.eth.personal.newAccount(pwd);
      const adminAccount = (await web3.eth.getAccounts())[0];
      await transfer(adminAccount, account, ethConfig.INITIAL_FUNDS);
      return account;
    },

    async createProject({ projectId, seAddress, projectName }) {
      logger.info(
        `[SC::Create Project] Creating Project: ${projectId} - ${projectName}`
      );
      seAddress = toChecksum(seAddress);
      const encodedMethod = COAProjectAdmin.methods
        .createProject(projectId, seAddress, projectName)
        .encodeABI();

      return worker.pushTransaction(
        COAProjectAdmin.address,
        encodedMethod,
        ethConfig.GAS_LIMIT
      );
    },

    async startProject({ projectId }) {
      logger.info(`[SC::Start Project] Starting Project: ${projectId}`);
      const encodedMethod = COAProjectAdmin.methods
        .startProject(projectId)
        .encodeABI();
      return worker.pushTransaction(
        COAProjectAdmin.address,
        encodedMethod,
        ethConfig.GAS_LIMIT
      );
    },

    async createActivities(activities) {
      try {
        const encodedMethods = activities.map(activity =>
          COAProjectAdmin.methods
            .createActivity(
              activity.id,
              activity.milestoneId,
              activity.projectId,
              toChecksum(activity.oracle.address),
              activity.tasks
            )
            .encodeABI()
        );

        await worker.pushAllTransactions(
          COAProjectAdmin.address,
          encodedMethods,
          ethConfig.GAS_LIMIT
        );
      } catch (error) {
        logger.error(error);
      }
    },

    async createMilestones(milestones) {
      try {
        const encodedMethods = milestones.map(milestone =>
          COAProjectAdmin.methods
            .createMilestone(
              milestone.id,
              milestone.project,
              milestone.budget,
              milestone.tasks
            )
            .encodeABI()
        );
        console.log(encodedMethods);

        await worker.pushAllTransactions(
          COAProjectAdmin.address,
          encodedMethods,
          ethConfig.GAS_LIMIT
        );
      } catch (error) {
        logger.error(error);
      }
    },

    /**
     * @param {*} sender The oracle address assigned to this activity
     * @param {*} onError error callback
     * @param {*} activity {activityId, projectId, milestoneId}
     */
    async validateActivity(sender, pwd, { activityId }) {
      logger.info(`[SC::Validate Activity] Validate Activity: ${activityId}`);

      const encodedMethod = COAOracle.methods
        .validateActivity(activityId)
        .encodeABI();

      await unlockAccount(sender, pwd);
      const txHash = await worker.pushTransaction(
        COAOracle.address,
        encodedMethod,
        ethConfig.GAS_LIMIT,
        sender
      );
      await lockAccount(sender);
      return txHash;
    },
    async isTransactionConfirmed(transactionHash) {
      const transaction = await web3.eth.getTransaction(transactionHash);
      return Boolean(
        transaction && transaction.blockHash && transaction.blockNumber
      );
    },

    async getAllPastEvents(options) {
      const CoaProjectAdminEvents = await COAProjectAdmin.getPastEvents(
        'allEvents',
        options
      );
      const CoaOracleEvents = await COAOracle.getPastEvents(
        'allEvents',
        options
      );

      const events = CoaProjectAdminEvents.concat(CoaOracleEvents);
      events.sort((event1, event2) => event1.blockNumber - event2.blockNumber);

      return events;
    },

    async uploadHashEvidenceToActivity(sender, pwd, { activityId, hashes }) {
      try {
        const encodedMethod = COAOracle.methods
          .uploadHashEvidence(activityId, toBytes64Array(hashes))
          .encodeABI();

        await unlockAccount(sender, pwd);
        const txHash = await worker.pushTransaction(
          COAOracle.address,
          encodedMethod,
          ethConfig.GAS_LIMIT,
          sender
        );
        await lockAccount(sender);
        return txHash;
      } catch (error) {
        return { error };
      }
    },

    async claimMilestone(sender, pwd, { milestoneId, projectId }) {
      try {
        const encodedMethod = COAProjectAdmin.methods
          .claimMilestone(milestoneId, projectId)
          .encodeABI();

        await unlockAccount(sender, pwd);
        const txHash = await worker.pushTransaction(
          COAProjectAdmin.address,
          encodedMethod,
          ethConfig.GAS_LIMIT,
          sender
        );
        await lockAccount(sender);
        return txHash;
      } catch (error) {
        return { error };
      }
    },

    async setMilestoneFunded({ milestoneId, projectId }) {
      try {
        const encodedMethod = COAProjectAdmin.methods
          .setMilestoneFunded(milestoneId, projectId)
          .encodeABI();
        return worker.pushTransaction(
          COAProjectAdmin.address,
          encodedMethod,
          ethConfig.GAS_LIMIT
        );
      } catch (error) {
        return { error };
      }
    }
  };
};

module.exports = ethServices;
