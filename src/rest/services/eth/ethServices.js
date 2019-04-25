const Web3 = require('web3');
const ethConfig = require('../../../../config/configs').eth;

const ethSend = async (sender, method, onError) => {
  return new Promise((resolve, reject) => {
    method
      .send({
        from: sender,
        gasLimit: 1000000
      })
      .on('transactionHash', transactionHash => {
        resolve(transactionHash);
      })
      .on('error', error => {
        if (onError) onError(error);
        reject();
      });
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
    async createProject(
      sender,
      onError,
      { projectId, seAddress, projectName }
    ) {
      logger.info(
        `[SC::Create Project] Creating Project: ${projectId} - ${projectName}`
      );

      const create = COAContract.methods.createProject(
        projectId,
        seAddress,
        projectName
      );

      const tx = create.send(
        {
          from: sender,
          gasLimit: 100000
        },
        (err, hash) => {
          if (err) {
            logger.error(err);
          }
          logger.info(`TxHash: ${hash}`);
        }
      );

      logger.info(tx);

      return tx;
    },
    async startProject(sender, onError, { projectId }) {
      logger.info(`[SC::Start Project] Starting Project: ${projectId}`);
      const start = COAContract.methods.startProject(projectId);
      const tx = start.send(
        {
          from: sender,
          gasLimit: 100000
        },
        (err, hash) => {
          if (err) {
            logger.error(err);
          }
          logger.info(`TxHash: ${hash}`);
        }
      );

      logger.info(tx);

      return tx;
    },
    async createMilestone(
      sender,
      onError,
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

      const tx = createMilestone.send(
        {
          from: sender,
          gasLimit: 100000
        },
        (err, hash) => {
          if (err) {
            logger.error(err);
          }
          logger.info(`TxHash: ${hash}`);
        }
      );

      logger.info(tx);

      return tx;
    },
    async createActivity(
      sender,
      onError,
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

      const tx = createActivity.send(
        {
          from: sender,
          gasLimit: 100000
        },
        (err, hash) => {
          if (err) {
            logger.error(err);
          }
          logger.info(`TxHash: ${hash}`);
        }
      );

      logger.info(tx);

      return tx;
    },
    /**
     * @param {*} sender The oracle address assigned to this activity
     * @param {*} onError error callback
     * @param {*} activity {activityId, projectId, milestoneId}
     */
    async validateActivity(
      sender,
      onError,
      { activityId, milestoneId, projectId }
    ) {
      logger.info(`[SC::Validate Activity] Validate Activity: ${activityId}`);

      const validateActivity = COAContract.methods.validateActivity(
        activityId,
        milestoneId,
        projectId
      );

      const tx = validateActivity.send(
        {
          from: sender,
          gasLimit: 100000
        },
        (err, hash) => {
          if (err) {
            logger.error(err);
          }
          logger.info(`TxHash: ${hash}`);
        }
      );

      logger.info(tx);

      return tx;
    },
    async isTransactionConfirmed(transactionHash) {
      const transaction = await web3.eth.getTransaction(transactionHash);
      return transaction && transaction.blockHash && transaction.blockNumber;
    }
  };
};

module.exports = ethServices;
