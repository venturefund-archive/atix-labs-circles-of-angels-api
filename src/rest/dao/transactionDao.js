const { blockchainStatus } = require('../util/constants');

const insertTransaction = transactionModel => async ({
  sender,
  receiver,
  data,
  transactionHash
}) => {
  const transaction = await transactionModel.findOne({ transactionHash });
  if (!transaction)
    return transactionModel.create({
      sender,
      receiver,
      data,
      transactionHash,
      status: blockchainStatus.PENDING
    });
  return transactionModel
    .updateOne({ where: { id: transaction.id } })
    .set({ sender, receiver, data, transactionHash });
};

const getUnconfirmedTransactions = transactionModel => async () =>
  transactionModel.find({ status: blockchainStatus.PENDING });

const confirmTransaction = transactionModel => async transactionHash =>
  transactionModel
    .updateOne({ where: { transactionHash } })
    .set({ status: blockchainStatus.CONFIRMED });

module.exports = transactionModel => ({
  insertTransaction: insertTransaction(transactionModel),
  getUnconfirmedTransactions: getUnconfirmedTransactions(transactionModel),
  confirmTransaction: confirmTransaction(transactionModel)
});
