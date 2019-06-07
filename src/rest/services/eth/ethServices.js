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

  const unlockAccount = async (account, pwd) => {
    await web3.eth.personal.unlockAccount(
      account,
      pwd,
      ethConfig.UNLOCK_DURATION
    );
  };

  const makeTx = async (sender, pwd, method) => {
    addressSender = toChecksum(sender);
    await unlockAccount(addressSender, pwd);
    return new Promise((resolve, reject) => {
      method.send(
        {
          from: addressSender,
          gasLimit: 10000000000
        },
        (err, hash) => {
          if (err) {
            logger.error(err);
            reject(err);
          }
          logger.info(`TxHash: ${hash}`);
          resolve(hash);
        }
      );
    });
  };

  const makeTxRequest = (sender, method) => {
    addressSender = toChecksum(sender);
    return method.send.request(
      {
        from: addressSender,
        gasLimit: 10000000000
      },
      (err, hash) => {
        if (err) {
          logger.error(err);
        }
        logger.info(`TxHash: ${hash}`);
      }
    );
  };

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

    async createProject(sender, pwd, { projectId, seAddress, projectName }) {
      logger.info(
        `[SC::Create Project] Creating Project: ${projectId} - ${projectName}`
      );
      seAddress = toChecksum(seAddress);
      const create = COAProjectAdmin.methods.createProject(
        projectId,
        seAddress,
        projectName
      );
      //return makeTx(sender, pwd, create);
      return worker.pushTransaction(create, { gasLimit: 10000000000 });
    },

    async startProject(sender, pwd, { projectId }) {
      logger.info(`[SC::Start Project] Starting Project: ${projectId}`);
      const start = COAProjectAdmin.methods.startProject(projectId);
      return makeTx(sender, pwd, start);
    },

    async createMilestone(
      sender,
      pwd,
      { milestoneId, projectId, budget, description }
    ) {
      logger.info(
        `[SC::Create Milestone] Creating Milestone: ${milestoneId} - ${description}`
      );

      const createMilestone = COAProjectAdmin.methods.createMilestone(
        milestoneId,
        projectId,
        budget,
        description
      );
      return makeTx(sender, pwd, createMilestone);
    },

    async createActivity(
      sender,
      pwd,
      { activityId, milestoneId, projectId, oracleAddress, description }
    ) {
      logger.info(
        `[SC::Create Activity] Creating Activity: ${activityId} - ${description}`
      );

      const createActivity = COAProjectAdmin.methods.createActivity(
        activityId,
        milestoneId,
        projectId,
        toChecksum(oracleAddress),
        description
      );

      return makeTx(sender, pwd, createActivity);
    },

    async createActivities(sender, pwd, activities) {
      try {
        const methods = [];
        activities.forEach(activity => {
          const createActivity = COAProjectAdmin.methods.createActivity(
            activity.id,
            activity.milestoneId,
            activity.projectId,
            toChecksum(activity.oracle.address),
            activity.tasks
          );
          console.log('creating activity method: ', activity.id);
          methods.push(createActivity);
        });
        await worker.pushAllTransactions(methods, { gasLimit: 1000000000000 });
        // for await (activity of activities) {
        //   const createActivity = COAProjectAdmin.methods.createActivity(
        //     activity.id,
        //     activity.milestoneId,
        //     activity.projectId,
        //     toChecksum(activity.oracle.address),
        //     activity.tasks
        //   );
        //   await worker.pushTransaction(createActivity, {
        //     gasLimit: 100000000000
        //   });        }
      } catch (error) {
        logger.error(error);
      }
    },

    async createMilestones(sender, pwd, milestones) {
      try {
        const methods = [];
        // for await (milestone of milestones) {
        //   const createMilestone = COAProjectAdmin.methods.createMilestone(
        //     milestone.id,
        //     milestone.project,
        //     milestone.budget,
        //     milestone.tasks
        //   );
        //   console.log('creating milestone method: ', milestone.id);
        //   await worker.pushTransaction(createMilestone, {
        //     gasLimit: 100000000000
        //   });
        //   methods.push(createMilestone);
        // }
        milestones.forEach(milestone => {
          const createMilestone = COAProjectAdmin.methods.createMilestone(
            milestone.id,
            milestone.project,
            milestone.budget,
            milestone.tasks
          );
          console.log('creating milestone method: ', milestone.id);
          methods.push(createMilestone);
        });
        await worker.pushAllTransactions(methods, { gasLimit: 100000000000 });
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
      logger.info(`[SC::Validate Activity] Validate Activity: ${sender}`);

      const validateActivity = COAOracle.methods.validateActivity(activityId);

      return makeTx(sender, pwd, validateActivity);
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

    async uploadHashEvidenceToActivity(sender, pwd, activityId, hashes) {
      try {
        const uploadHashEvidence = COAOracle.methods.uploadHashEvidence(
          activityId,
          toBytes64Array(hashes)
        );
        return makeTx(sender, pwd, uploadHashEvidence);
      } catch (error) {
        return { error };
      }
    },

    async claimMilestone(sender, pwd, { milestoneId, projectId }) {
      try {
        const claimMilestone = COAProjectAdmin.methods.claimMilestone(
          milestoneId,
          projectId
        );
        return makeTx(sender, pwd, claimMilestone);
      } catch (error) {
        return { error };
      }
    },

    async setMilestoneFunded(sender, pwd, { milestoneId, projectId }) {
      try {
        const setMilestoneFunded = COAProjectAdmin.methods.setMilestoneFunded(
          milestoneId,
          projectId
        );
        return makeTx(sender, pwd, setMilestoneFunded);
      } catch (error) {
        return { error };
      }
    }
  };
};

module.exports = ethServices;
