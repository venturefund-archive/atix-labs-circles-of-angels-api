/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

class MemPool {
  constructor(transactionDao, timelapse, worker, logger) {
    this.transactionDao = transactionDao;
    this.MAX_TIME = 750; // in seconds
    this.logger = logger;
    this.timelapse = timelapse;
    this.worker = worker;
    this.startCheckTransactions();
  }

  async startCheckTransactions() {
    setInterval(async () => {
      await this.checkTransactions();
    }, this.timelapse);
  }

  async checkTransactions() {
    const actualDate = new Date();
    const transactions = await this.transactionDao.getUnconfirmedTransactions();
    this.logger.info('[eth Mem Pool] Checking transactions', transactions);
    transactions.forEach(async transaction => {
      const lapse = (actualDate - new Date(transaction.updatedAt)) / 1000;

      if (lapse >= this.MAX_TIME) {
        if (
          await this.worker.isTransactionConfirmed(transaction.transactionHash)
        )
          await this.transactionDao.confirmTransaction(
            transaction.transactionHash
          );
        else
          this.worker.pushTransaction(
            transaction.receiver,
            transaction.data,
            transaction.sender
          );
      }
    });
  }
}

const ethMemPoolBuilder = (
  transactionDao,
  timelapse,
  worker,
  logger,
  gasLimit
) => {
  let instance;

  const createInstance = () => {
    const response = new MemPool(
      transactionDao,
      timelapse,
      worker,
      logger,
      gasLimit
    );
    return response;
  };

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
};

module.exports = ethMemPoolBuilder;
