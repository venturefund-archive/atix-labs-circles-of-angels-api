/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const Web3 = require('web3');
const { union } = require('lodash');
const HDWalletProvider = require('truffle-hdwallet-provider');
const ethConfig = require('config').eth;
const ethMemPoolBuilder = require('./ethMemPool');
const apiHelper = require('../helper');

const ethWorker = (web3, { logger }) => {
  const { transactionDao } = apiHelper.helper.daos;
  const transactionCallbacks = require('./transactionCallbacks')(logger);
  let allowedAddresses = ethConfig.ALLOWED_ADDRESSES;
  let usedAddresses = [];
  const gasLimit = ethConfig.GAS_LIMIT;
  const reintentLapse = ethConfig.REINTENT_LAPSE;

  const work = async () => {
    try {
      const pool = await transactionDao.getPoolTransactions();
      await checkAddresses();
      if (allowedAddresses.length > 0 && pool.length > 0) {
        const transaction = pool.shift();
        await resolveTransaction(transaction);
      }
    } catch (error) {
      logger.error(error);
    }
    setTimeout(() => {
      work();
    }, 5000);
  };

  const checkAddresses = async () => {
    const newUsedAddresses = [];
    const newAllowedAddresses = [];
    const addresses = union(usedAddresses, allowedAddresses);
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      // eslint-disable-next-line no-await-in-loop
      const pendingTx = await getPendingTransactionCount(address);
      // eslint-disable-next-line no-await-in-loop
      const txs = await getTransactionCount(address);
      const hasPending = pendingTx - txs >= 1;
      if (!hasPending) newAllowedAddresses.push(address);
      else newUsedAddresses.push(address);
    }
    usedAddresses = newUsedAddresses;
    allowedAddresses = newAllowedAddresses;
  };

  const useAddress = address => {
    if (allowedAddresses.includes(address)) {
      allowedAddresses = allowedAddresses.filter(a => address !== a);
      if (!usedAddresses.includes(address)) usedAddresses.push(address);
    }
  };

  const getAddress = () => {
    const address =
      allowedAddresses[Math.floor(Math.random() * allowedAddresses.length)];
    useAddress(address);
    return address;
  };

  const getTransactionCount = async address => {
    return web3.eth.getTransactionCount(address);
  };

  const getPendingTransactionCount = async address => {
    return web3.eth.getTransactionCount(address, 'pending');
  };

  const toChecksum = address => web3.utils.toChecksumAddress(address);

  const saveTransaction = async ({
    sender,
    receiver,
    data,
    transactionHash,
    privKey,
    activityId,
    milestoneId,
    projectId,
    type,
    status
  }) => {
    logger.info('[ETH Worker] - saving transaction', {
      sender,
      receiver,
      data,
      transactionHash,
      privKey,
      activityId,
      milestoneId,
      projectId,
      type,
      status
    });
    return transactionDao.insertTransaction({
      sender,
      receiver,
      data,
      transactionHash,
      privKey,
      activityId,
      milestoneId,
      projectId,
      type,
      status
    });
  };

  const makeTx = ({ id, receiver, sender, data }) => {
    const addressSender = toChecksum(sender);
    return new Promise(async (resolve, reject) => {
      const nonce = (await web3.eth.getTransactionCount(addressSender)) || 0;
      const txConfig = {
        nonce,
        to: receiver,
        from: addressSender,
        data
      };
      web3.eth
        .sendTransaction(txConfig)
        .on('transactionHash', async hash => {
          const tx = await web3.eth.getTransaction(hash);
          if (hash && tx) {
            transactionDao.sendTransaction(id, hash, sender);
            resolve(hash);
          } else reject('Cannot make transaction correctly');
        })
        .on('error', err => {
          logger.error(err);
          reject(err);
        });
    });
  };

  const makeSignedTx = ({ id, receiver, sender, privKey, data }) => {
    if (!data) return;
    return new Promise(async (resolve, reject) => {
      const cleanPrivateKey =
        privKey.slice(0, 2) === '0x' ? privKey.slice(2) : privKey;
      const addressSender = toChecksum(sender);
      const nonce = await web3.eth.getTransactionCount(addressSender);
      const txConfig = {
        nonce,
        from: addressSender,
        to: receiver,
        data
      };
      const httpWeb3 = new Web3(
        new HDWalletProvider(
          [cleanPrivateKey],
          ethConfig.HTTP_HOST,
          0,
          1,
          false
        )
      );
      httpWeb3.eth
        .sendTransaction(txConfig)
        .on('transactionHash', async hash => {
          const tx = await web3.eth.getTransaction(hash);
          if (hash && tx) {
            transactionDao.sendTransaction(id, hash, sender);
            resolve(hash);
          } else reject('Cannot make transaction correctly');
        })
        .on('error', err => {
          logger.error(err);
          reject(err);
        });
    });
  };

  const resolveTransaction = async transaction => {
    try {
      const {
        projectId,
        milestoneId,
        activityId,
        type,
        sender,
        privKey
      } = transaction;

      const ids = { projectId, milestoneId, activityId };
      const callback = transactionCallbacks[type];
      let address = sender || false;
      if (!privKey) {
        address = getAddress();
      }
      if (!address) return;
      const newTransaction = { ...transaction, sender: address };
      if (sender && privKey) {
        await callback(await makeSignedTx(newTransaction), ids);
        return;
      }
      await callback(await makeTx(newTransaction), ids);
    } catch (error) {
      logger.error(error);
      return { error };
    }
  };

  const worker = {
    async pushTransaction(transaction) {
      try {
        await saveTransaction(transaction);
      } catch (error) {
        logger.error(error);
      }
    },

    async isTransactionConfirmed(transactionHash) {
      const transaction = await web3.eth.getTransaction(transactionHash);
      return Boolean(
        transaction && transaction.blockHash && transaction.blockNumber
      );
    }
  };
  ethMemPoolBuilder(
    transactionDao,
    reintentLapse,
    worker,
    logger
  ).getInstance();
  work();
  return worker;
};
module.exports = ethWorker;
