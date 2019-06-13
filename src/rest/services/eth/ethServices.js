/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const Web3 = require('web3');
const ethConfig = require('config').eth;
const workerBuilder = require('./ethWorker');

const mockAddresses = [
  '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
  '0x6704fbfcd5ef766b287262fa2281c105d57246a6',
  '0x9e1ef1ec212f5dffb41d35d9e5c14054f26c6560',
  '0xce42bdb34189a93c55de250e011c68faee374dd3',
  '0x97a3fc5ee46852c1cf92a97b7bad42f2622267cc',
  '0xb9dcbf8a52edc0c8dd9983fcc1d97b1f5d975ed7',
  '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
  '0xe84da28128a48dd5585d1abb1ba67276fdd70776',
  '0xcc036143c68a7a9a41558eae739b428ecde5ef66',
  '0xe2b3204f29ab45d5fd074ff02ade098fbc381d42',
  '0xd51128f302755666c42e3920d72ff2fe632856a9'
];

/**
 * Init a ethereum services, receiving the provider host and returns and object
 * @param {string} providerHost
 */
const ethServices = async (providerHost, { logger }) => {
  const web3 = new Web3(providerHost);
  const worker = workerBuilder(web3, mockAddresses, {
    maxTransactionsPerAccount: 4,
    logger
  });
  const COAProjectAdmin = new web3.eth.Contract(
    ethConfig.CONTRACT_ADMIN_ABI,
    ethConfig.CONTRACT_ADMIN_ADDRESS,
    ethConfig.DEFAULT_CONFIG
  );

  const COAOracle = new web3.eth.Contract(
    ethConfig.CONTRACT_ORACLE_ABI,
    ethConfig.CONTRACT_ORACLE_ADDRESS,
    ethConfig.DEFAULT_CONFIG
  );

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

  const suscribeToEvent = async (event, callback) => {
    event({}, (error, event) => {
      if (error) return { error };
      callback(event);
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

    async suscribeNewProjectEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.NewProject, callback);
    },

    async suscribeNewMilestoneEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.NewMilestone, callback);
    },

    async suscribeNewActivityEvent(callback) {
      suscribeToEvent(COAOracle.events.NewActivity, callback);
    },

    async suscribeActivityValidatedEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.ActivityValidated, callback);
    },

    async suscribeMilestoneCompletedEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.MilestoneCompleted, callback);
    },

    async suscribeProjectCompletedEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.ProjectCompleted, callback);
    },

    async suscribeMilestoneClaimableEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.MilestoneClaimable, callback);
    },

    async suscribeMilestoneClaimedEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.MilestoneClaimed, callback);
    },

    async suscribeMilestoneFundedEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.MilestoneFunded, callback);
    },

    async suscribeProjectStartedEvent(callback) {
      suscribeToEvent(COAProjectAdmin.events.ProjectStarted, callback);
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
