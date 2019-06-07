const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const ethWorker = (web3, addresses, { maxTransactionsPerAccount, logger }) => {
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

  const toChecksum = address => {
    return web3.utils.toChecksumAddress(address);
  };

  const makeTx = async (sender, method, { gasLimit }) => {
    addressSender = toChecksum(sender);
    return new Promise((resolve, reject) => {
      method.send(
        {
          from: addressSender,
          gasLimit
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

  const makeTxRequest = (sender, method, { gasLimit }) => {
    addressSender = toChecksum(sender);
    return method.send.request(
      {
        from: addressSender,
        gasLimit
      },
      (err, hash) => {
        if (err) {
          logger.error(err);
        }
        logger.info(`TxHash: ${hash}`);
      }
    );
  };

  return {
    async pushTransaction(method, { gasLimit }) {
      const addressIndex = getRndInteger(0, addresses.length - 1);
      const address = addresses[addressIndex];
      if ((await getAllowedTransactions(address)) > 0) {
        return await makeTx(address, method, { gasLimit });
      } else {
        return this.pushTransaction(method, { gasLimit });
      }
    },

    async pushAllTransactions(methods, { gasLimit }) {
      const addressIndex = getRndInteger(0, addresses.length - 1);
      const address = addresses[addressIndex];
      if (methods.length == 0) return;
      const allowedTransactions = await getAllowedTransactions(address);
      console.log(allowedTransactions);
      if (allowedTransactions <= 0)
        this.pushAllTransactions(methods, { gasLimit });

      const batch = new web3.BatchRequest();
      let execute = false;
      for (let i = 0; i < allowedTransactions; i++) {
        const method = methods.pop();
        if (!method || !method.send) continue;
        const transactionRequest = makeTxRequest(address, method, {
          gasLimit
        });
        execute = true;
        batch.add(transactionRequest);
      }
      if (execute) await batch.execute();
      this.pushAllTransactions(methods, { gasLimit });
    }
  };
};
module.exports = ethWorker;
