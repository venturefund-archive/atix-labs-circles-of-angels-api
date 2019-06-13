/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const updateLastBlock = blockchainBlockModel => async (
  blockNumber,
  transactionHash
) => {
  const lastBlock = await blockchainBlockModel.findOrCreate(
    {
      id: {
        '>': 0
      }
    },
    { blockNumber, transactionHash }
  );
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
