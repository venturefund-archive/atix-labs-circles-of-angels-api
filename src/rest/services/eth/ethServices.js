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
 * Init a ethereum services, receiving a web3 instance and a worker instance
 * @param {object} web3
 */
const ethServices = async (
  web3,
  { COAProjectAdmin, COAOracle },
  { logger }
) => {
  let worker;

  const toBytes64Array = array => {
    array = array.map(row =>
      row.split('').map(c => web3.utils.asciiToHex(c).slice(0, 4))
    );
    return array;
  };

  const toChecksum = address => web3.utils.toChecksumAddress(address);

  const transfer = async (sender, receiver, value, onConfirm) => {
    return new Promise((resolve, reject) => {
      web3.eth
        .sendTransaction({
          from: sender,
          to: receiver,
          value
        })
        .on('transactionHash', hash => {
          logger.info(`TxHash: ${hash}`);
          resolve(hash);
        })
        .on('confirmation', onConfirm)
        .on('error', error => {
          logger.error(error);
          reject(error);
        });
    });
  };

  return {
    async initialize() {
      worker = await workerBuilder(web3, {
        maxTransactionsPerAccount: 4,
        logger
      });
    },

    async createAccount() {
      const account = await web3.eth.accounts.create(web3.utils.randomHex(32));
      return account;
    },

    async transferInitialFundsToAccount(address, onConfirm) {
      const adminAccount = (await web3.eth.getAccounts())[0];
      await transfer(adminAccount, address, ethConfig.INITIAL_FUNDS, onConfirm);
    },

    async createProject({ projectId, seAddress, projectName }) {
      logger.info(
        `[SC::Create Project] Creating Project: ${projectId} - ${projectName}`
      );
      const checksumAddress = toChecksum(seAddress);
      const encodedMethod = COAProjectAdmin.methods
        .createProject(projectId, checksumAddress, projectName)
        .encodeABI();
      return worker.pushTransaction(COAProjectAdmin.address, encodedMethod);
    },

    async startProject({ projectId }) {
      logger.info(`[SC::Start Project] Starting Project: ${projectId}`);
      const encodedMethod = COAProjectAdmin.methods
        .startProject(projectId)
        .encodeABI();
      return worker.pushTransaction(COAProjectAdmin.address, encodedMethod);
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

        return (await worker.pushAllTransactions(
          COAProjectAdmin.address,
          encodedMethods
        )).response;
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

        return (await worker.pushAllTransactions(
          COAProjectAdmin.address,
          encodedMethods
        )).response;
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

      //await unlockAccount(sender, pwd);
      const txHash = await worker.pushTransaction(
        COAOracle.address,
        encodedMethod,
        sender
      );
      //await lockAccount(sender);
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

        //await unlockAccount(sender, pwd);
        const txHash = await worker.pushTransaction(
          COAOracle.address,
          encodedMethod,
          sender
        );
        //await lockAccount(sender);
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

        //await unlockAccount(sender, pwd);
        const txHash = await worker.pushTransaction(
          COAProjectAdmin.address,
          encodedMethod,
          sender
        );
        //await lockAccount(sender);
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
        return worker.pushTransaction(COAProjectAdmin.address, encodedMethod);
      } catch (error) {
        return { error };
      }
    }
  };
};

module.exports = ethServices;
