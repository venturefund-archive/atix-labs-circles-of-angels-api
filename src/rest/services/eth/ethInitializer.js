/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const ethConfig = require('config').eth;
const { isEmpty } = require('lodash');
const ethService = require('./ethServices');
const ethServiceMock = require('./ethServicesMock');
const ethListenerBuilder = require('./eventListener');

const ethInitializer = async ({ logger }) => {
  let eth;
  if (!isEmpty(ethConfig)) {
    const { mnemonic } = ethConfig;
    let httpWeb3;
    if (mnemonic)
      httpWeb3 = new Web3(
        new HDWalletProvider(ethConfig.mnemonic, ethConfig.HTTP_HOST)
      );
    else httpWeb3 = new Web3(ethConfig.HTTP_HOST);

    eth = await ethService(
      httpWeb3,
      {
        COAProjectAdmin: buildProjectAdminContract(httpWeb3),
        COAOracle: buildOracleContract(httpWeb3)
      },
      { logger }
    );
  } else {
    eth = await ethServiceMock();
  }

  const wsWeb3 = new Web3(ethConfig.WS_HOST);
  eth.initListener = async () => {
    const listener = await ethListenerBuilder(
      eth,
      {
        COAProjectAdmin: buildProjectAdminContract(wsWeb3),
        COAOracle: buildOracleContract(wsWeb3)
      },
      { logger }
    );
    eth.listener = listener;
  };

  return eth;
};

const buildProjectAdminContract = web3 => {
  return new web3.eth.Contract(
    ethConfig.CONTRACT_ADMIN_ABI,
    ethConfig.CONTRACT_ADMIN_ADDRESS,
    ethConfig.DEFAULT_CONFIG
  );
};

const buildOracleContract = web3 => {
  return new web3.eth.Contract(
    ethConfig.CONTRACT_ORACLE_ABI,
    ethConfig.CONTRACT_ORACLE_ADDRESS,
    ethConfig.DEFAULT_CONFIG
  );
};

module.exports = ethInitializer;
