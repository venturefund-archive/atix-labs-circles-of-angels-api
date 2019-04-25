const Web3 = require('web3');
const ethConfig = require('../../../../config/configs').eth;

const makeTx = async (sender, method, logger) => {
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

  // const create = COAContract.methods.createProject(
  //   1,
  //   '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
  //   'Nombre proyecto'
  // );
  // // console.log(create);
  // // console.log(create.send);
  // // console.log('antes');

  // const llamada = create.send(
  //   {
  //     from: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
  //     gasLimit: 100000
  //   },
  //   (err, hash) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //     console.log(`TxHash: ${hash}`);
  //   }
  // );
  // console.log('tu hna');
  // console.log(llamada);

  // .send({
  //   sender: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
  //   gasLimit: 100000
  // });

  // const res = await ethSend(
  //   '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
  //   COAContract.methods.createProject(
  //     1,
  //     '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
  //     'Nombre proyecto'
  //   ),
  //   error => console.error(error)
  // );
  // console.log(res);

  return {
    async createAccount() {
      return web3.eth.accounts.create();
    },
    async createProject(sender, { projectId, seAddress, projectName }) {
      logger.info(
        `[SC::Create Project] Creating Project: ${projectId} - ${projectName}`
      );
      const create = COAContract.methods.createProject(
        projectId,
        seAddress,
        projectName
      );
      return makeTx(sender, create, logger);
    },

    async startProject(sender, { projectId }) {
      logger.info(`[SC::Start Project] Starting Project: ${projectId}`);
      const start = COAContract.methods.startProject(projectId);
      return makeTx(sender, start, logger);
    },

    async createMilestone(
      sender,
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

      return makeTx(sender, createMilestone, logger);
    },

    async createActivity(
      sender,
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

      return makeTx(sender, createActivity, logger);
    },
    /**
     * @param {*} sender The oracle address assigned to this activity
     * @param {*} onError error callback
     * @param {*} activity {activityId, projectId, milestoneId}
     */
    async validateActivity(sender, { activityId, milestoneId, projectId }) {
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

      return makeTx(sender, validateActivity, logger);
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
