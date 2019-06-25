/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const ethConfig = require('config').eth;
const ethMemPoolBuilder = require('./ethMemPool');
const apiHelper = require('../helper');

const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const ethWorker = (web3, { maxTransactionsPerAccount, logger }) => {
  const { transactionDao } = apiHelper.helper.daos;
  const addresses = ethConfig.ALLOWED_ADDRESSES;
  const gasLimit = ethConfig.GAS_LIMIT;
  const reintentLapse = ethConfig.REINTENT_LAPSE;
  const getTransactionCount = async address => {
    return web3.eth.getTransactionCount(address);
  };

  const getPendingTransactionCount = async address => {
    return web3.eth.getTransactionCount(address, 'pending');
  };

  const getAllowedTransactions = async address => {
    const transactionCount = await getTransactionCount(address);
    const pendingTransactionCount = await getPendingTransactionCount(address);
    return (
      maxTransactionsPerAccount - (pendingTransactionCount - transactionCount)
    );
  };

  const toChecksum = address => web3.utils.toChecksumAddress(address);

  const saveTransaction = async ({
    sender,
    receiver,
    data,
    transactionHash
  }) => {
    logger.info('[ETH Worker] - saving transaction', {
      sender,
      receiver,
      data,
      transactionHash
    });
    return transactionDao.insertTransaction({
      sender,
      receiver,
      data,
      transactionHash
    });
  };

  const makeTxRequest = (contractAddress, sender, encodedMethod) => {
    if (!encodedMethod) return;
    const addressSender = toChecksum(sender);
    const txConfig = {
      to: contractAddress,
      from: addressSender,
      data: encodedMethod,
      gasLimit
    };
    return web3.eth.sendTransaction.request(txConfig, async (err, hash) => {
      if (err) {
        logger.error(err);
      }
      if (hash)
        await saveTransaction({
          transactionHash: hash,
          sender: addressSender,
          receiver: contractAddress,
          data: encodedMethod
        });
      logger.info(`TxHash: ${hash}`);
    });
  };

  const makeTx = (contractAddress, sender, encodedMethod) => {
    if (!encodedMethod) return;
    const addressSender = toChecksum(sender);
    return new Promise((resolve, reject) => {
      const txConfig = {
        to: contractAddress,
        from: addressSender,
        data: encodedMethod,
        gasLimit
      };
      web3.eth.sendTransaction(txConfig, async (err, hash) => {
        if (err) {
          logger.error(err);
          reject(err);
        }
        logger.info(`TxHash: ${hash}`);
        if (hash)
          await saveTransaction({
            transactionHash: hash,
            sender: addressSender,
            receiver: contractAddress,
            data: encodedMethod
          });
        resolve(hash);
      });
    });
  };

  const worker = {
    async isTransactionConfirmed(transactionHash) {
      const transaction = await web3.eth.getTransaction(transactionHash);
      console.log(transaction);
      return Boolean(transaction);
    },
    async pushTransaction(contractAddress, encodedMethod, sender) {
      if (!encodedMethod) return;
      let address = sender;
      if (!sender) {
        const addressIndex = getRndInteger(0, addresses.length - 1);
        address = addresses[addressIndex];
      }

      if ((await getAllowedTransactions(address)) > 0) {
        return makeTx(contractAddress, address, encodedMethod, gasLimit);
      }
      this.pushTransaction(contractAddress, encodedMethod, gasLimit, sender);
    },

    async pushAllTransactions(contractAddress, encodedMethods, gasLimit) {
      if (!contractAddress) return;
      const addressIndex = getRndInteger(0, addresses.length - 1);
      const address = addresses[addressIndex];
      if (encodedMethods.length === 0) return;
      const allowedTransactions = await getAllowedTransactions(address);

      if (allowedTransactions <= 0)
        this.pushAllTransactions(contractAddress, encodedMethods);

      const batch = new web3.BatchRequest();
      let execute = false;
      for (let i = 0; i < allowedTransactions; i++) {
        const encodedMethod = encodedMethods.shift();
        const request = makeTxRequest(
          contractAddress,
          address,
          encodedMethod,
          gasLimit
        );
        if (!request) continue;
        execute = true;
        batch.add(request);
      }
      if (execute) {
        const txHashes = await batch.execute();
        return txHashes;
      }
      await this.pushAllTransactions(contractAddress, encodedMethods);
    }
  };
  const ethMemPool = ethMemPoolBuilder(
    transactionDao,
    reintentLapse,
    worker,
    logger
  ).getInstance();
  return worker;
};
module.exports = ethWorker;
