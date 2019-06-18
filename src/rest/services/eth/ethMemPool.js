/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

class MemPool {
  constructor(timelapse, web3, worker, logger) {
    this.MAX_TIME = 750; // in seconds
    this.web3 = web3;
    this.transactions = [];
    this.logger = logger;
    this.timelapse = timelapse;
    this.worker = worker;
    this.startCheckTransactions();
  }

  startCheckTransactions() {
    setTimeout(async () => {
      await this.checkTransactions();
    }, this.timelapse);
  }

  async isConfirmed(hash) {
    const transaction = await this.web3.eth.getTransaction(hash);
    return Boolean(
      transaction && transaction.blockHash && transaction.blockNumber
    );
  }

  async checkTransactions() {
    const actualDate = new Date();
    const auxTransactions = this.transactions;
    this.transactions = [];

    auxTransactions.forEach(async transaction => {
      const isConfirmed = await isConfirmed(transaction.hash);
      if (!isConfirmed) {
        if (
          new Date(actualDate - transaction.timestamp).getSeconds() >=
          this.MAX_TIME
        ) {
          this.worker.pushTransaction(
            transaction.txConfig.to,
            transaction.txConfig.data,
            transaction.txConfig.gasLimit,
            transaction.txConfig.sender
          );
        } else {
          this.transactions.push(transaction);
        }
      }
    });
    this.logger.info('[eth Mem Pool] Checking transactions', this.transactions);
    this.startCheckTransactions();
  }

  pushTransaction({ hash, txConfig }) {
    this.logger.info('[eth Mem Pool] pushing new transaction: ', hash);
    this.transactions.push({ hash, txConfig, timestamp: new Date() });
  }
}

const ethMemPoolBuilder = (timelapse, worker, logger) => {
  let instance;

  const createInstance = () => {
    const response = new MemPool(timelapse, worker, logger);
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
