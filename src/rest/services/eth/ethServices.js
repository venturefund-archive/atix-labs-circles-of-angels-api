const Web3 = require('web3');
const ethConfig = require('../../../../config/configs')(
  process.env.NODE_ENV || 'development'
).eth;

/**
 * Init a ethereum services, receiving the provider host and returns and object
 * @param {string} providerHost
 */
const ethServices = async (providerHost, { logger }) => {
  const web3 = new Web3(providerHost);
  const COAContract = new web3.eth.Contract(
    ethConfig.CONTRACT_ABI,
    ethConfig.CONTRACT_ADDRESS,
    ethConfig.DEFAULT_CONFIG
  );

  const makeTx = async (sender, pwd, method) => {
    await web3.eth.personal.unlockAccount(
      sender,
      pwd,
      ethConfig.UNLOCK_DURATION
    );
    return new Promise((resolve, reject) => {
      method.send(
        {
          from: sender,
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
      const create = COAContract.methods.createProject(
        projectId,
        seAddress,
        projectName
      );
      return makeTx(sender, pwd, create);
    },

    async startProject(sender, pwd, { projectId }) {
      logger.info(`[SC::Start Project] Starting Project: ${projectId}`);
      const start = COAContract.methods.startProject(projectId);
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

      const createMilestone = COAContract.methods.createMilestone(
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

      const createActivity = COAContract.methods.createActivity(
        activityId,
        milestoneId,
        projectId,
        oracleAddress,
        description
      );

      return makeTx(sender, pwd, createActivity);
    },
    /**
     * @param {*} sender The oracle address assigned to this activity
     * @param {*} onError error callback
     * @param {*} activity {activityId, projectId, milestoneId}
     */
    async validateActivity(
      sender,
      pwd,
      { activityId, milestoneId, projectId }
    ) {
      logger.info(`[SC::Validate Activity] Validate Activity: ${activityId}`);
      logger.info(
        `[SC::Validate Activity] Validate Activity project: ${projectId}`
      );
      logger.info(
        `[SC::Validate Activity] Validate Activity milestone: ${milestoneId}`
      );
      logger.info(`[SC::Validate Activity] Validate Activity: ${sender}`);

      const validateActivity = COAContract.methods.validateActivity(
        activityId,
        milestoneId,
        projectId
      );

      return makeTx(sender, pwd, validateActivity);
    },
    async isTransactionConfirmed(transactionHash) {
      const transaction = await web3.eth.getTransaction(transactionHash);
      return Boolean(
        transaction && transaction.blockHash && transaction.blockNumber
      );
    }
  };
};

module.exports = ethServices;
