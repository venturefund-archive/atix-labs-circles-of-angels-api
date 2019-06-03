const updateLastBlock = blockchainBlockModel => async (
  blockNumber,
  transactionHash
) => {
  const lastBlock = (await blockchainBlockModel.find())[0];
  const updatedBlock = await blockchainBlockModel
    .update({ blockNumber: lastBlock.blockNumber })
    .set({ blockNumber, transactionHash });
  return updatedBlock;
};

const getLastBlock = blockchainBlockModel => async () => {
  const lastBlock = (await blockchainBlockModel.find())[0];
  return lastBlock;
};

module.exports = blockchainBlockModel => ({
  updateLastBlock: updateLastBlock(blockchainBlockModel),
  getLastBlock: getLastBlock(blockchainBlockModel)
});
