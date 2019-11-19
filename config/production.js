/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const COAProjectAdmin = require('../../circles-of-angels-solidity/build/contracts/COAProjectAdmin.json');
const COAOracle = require('../../circles-of-angels-solidity/build/contracts/COAOracle.json');

require('dotenv').config()

module.exports = {
  server: {
    host: process.env.HOST
  },
  eth: {
    HTTP_HOST: process.env.HTTP_HOST || 'http://localhost:8545',
    WS_HOST: process.env.WS_HOST || 'ws://localhost:8545',
    MNEMONIC: process.env.MNEMONIC || false,
    CONTRACT_ADMIN_ADDRESS:
      process.env.PROJECT_ADMIN_ADDRESS ||
      COAProjectAdmin.networks['31'].address,
    CONTRACT_ORACLE_ADDRESS:
      process.env.ORACLE_ADDRESS || COAOracle.networks['31'].address,
    CONTRACT_ADMIN_ABI: COAProjectAdmin.abi,
    CONTRACT_ORACLE_ABI: COAOracle.abi,
    DEFAULT_CONFIG: {
      defaultGas: 50000,
      defaultGasPrice: 1000000
    },
    FUND_TX_GAS: 50000,
    FUND_TX_GAS_PRICE: 100000000,
    UNLOCK_DURATION: 1000000,
    INITIAL_FUNDS: 1000000,
    GAS_LIMIT: 6800000,
    ALLOWED_ADDRESSES: process.env.ALLOWED_ADDRESSES.split(','),
    NUMBER_ACCOUNTS: 15,
    REINTENT_LAPSE: 780000,
    MAX_TX_ACCOUNT: 1
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://www.circlesofangels.org:3000'
};
