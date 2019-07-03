const { blockchainStatus } = require('../util/constants');

const insertTransaction = transactionModel => async ({
  sender,
  receiver,
  data,
  transactionHash,
  privKey,
  activityId,
  milestoneId,
  projectId,
  type
}) => {
  const transaction = await transactionModel.findOne({ where: { data } });
  if (!transaction)
    return transactionModel.create({
      sender,
      receiver,
      data,
      transactionHash,
      status: blockchainStatus.PENDING,
      activityId,
      milestoneId,
      projectId,
      privKey,
      type
    });
  return transactionModel
    .updateOne({ where: { id: transaction.id } })
    .set({ sender, receiver, data, transactionHash, privKey });
};

const getUnconfirmedTransactions = transactionModel => async () =>
  transactionModel.find({
    status: blockchainStatus.PENDING,
    transactionHash: { '!=': null }
  });

const getPoolTransactions = transactionModel => async () =>
  transactionModel.find({
    where: { status: blockchainStatus.PENDING },
    sort: 'id DESC'
  });

const sendTransaction = transactionModel => async (
  id,
  transactionHash,
  sender
) =>
  transactionModel
    .updateOne(id)
    .set({ status: blockchainStatus.SENT, transactionHash, sender });

const confirmTransaction = transactionModel => async transactionHash =>
  transactionModel
    .updateOne({ where: { transactionHash } })
    .set({ status: blockchainStatus.CONFIRMED });

module.exports = transactionModel => ({
  insertTransaction: insertTransaction(transactionModel),
  getUnconfirmedTransactions: getUnconfirmedTransactions(transactionModel),
  confirmTransaction: confirmTransaction(transactionModel),
  sendTransaction: sendTransaction(transactionModel),
  getPoolTransactions: getPoolTransactions(transactionModel)
});
