const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  const toChecksum = address => web3.utils.toChecksumAddress(address);

  const makeTxRequest = (contractAddress, sender, encodedMethod, gasLimit) => {
    if (!encodedMethod) return;
    const addressSender = toChecksum(sender);
    return web3.eth.sendTransaction.request(
      {
        to: contractAddress,
        from: addressSender,
        data: encodedMethod,
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

  const makeTx = (contractAddress, sender, encodedMethod, gasLimit) => {
    if (!encodedMethod) return;
    const addressSender = toChecksum(sender);
    return new Promise((resolve, reject) => {
      web3.eth.sendTransaction(
        {
          to: contractAddress,
          from: addressSender,
          data: encodedMethod,
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

  return {
    async pushTransaction(contractAddress, encodedMethod, gasLimit, sender) {
      if (!encodedMethod) return;
      let address = sender;
      if (!sender){
        const addressIndex = getRndInteger(0, addresses.length - 1);
        address = addresses[addressIndex];
      }

      if ((await getAllowedTransactions(address)) > 0) {
        return makeTx(contractAddress, address, encodedMethod, gasLimit);
      }
      this.pushTransaction(contractAddress, encodedMethod, gasLimit);
    },

    async pushAllTransactions(contractAddress, encodedMethods, gasLimit) {
      const addressIndex = getRndInteger(0, addresses.length - 1);
      const address = addresses[addressIndex];
      if (encodedMethods.length == 0) return;
      const allowedTransactions = await getAllowedTransactions(address);

      if (allowedTransactions <= 0)
        this.pushAllTransactions(contractAddress, encodedMethods, gasLimit);

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
      await this.pushAllTransactions(contractAddress, encodedMethods, gasLimit);
    }
  };
};
module.exports = ethWorker;