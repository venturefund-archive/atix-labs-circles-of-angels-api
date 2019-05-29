const Web3 = require('web3');
const ethConfig = require('../../../../config/configs').eth;

/**
 * Init a ethereum services, receiving the provider host and returns and object
 * @param {string} providerHost
 */
const ethServices = async (providerHost, { logger }) => {
  const web3 = new Web3(providerHost);
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

  const toChecksum = address => {
    return web3.utils.toChecksumAddress(address);
  };

  const makeTx = async (sender, pwd, method) => {
    addressSender = toChecksum(sender);
    await web3.eth.personal.unlockAccount(
      addressSender,
      pwd,
      ethConfig.UNLOCK_DURATION
    );
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
      return makeTx(sender, pwd, create);
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

    async uploadHashEvidenceToActivity(sender, pwd, activityId, hashes) {
      const uploadHashEvidence = COAOracle.methods.uploadHashEvidence(activityId, hashes);
      return makeTx(sender, pwd, uploadHashEvidence);
    },
    
    async updateMilestonFundStatus(sender, pwd, { milestoneId, status }) {
      const updateMilestoneFundStatus = COAProjectAdmin.methods.updateMilestoneFundStatus(milestoneId, status);
      return makeTx(sender, pwd, updateMilestoneFundStatus);
    }
  };
};

module.exports = ethServices;
