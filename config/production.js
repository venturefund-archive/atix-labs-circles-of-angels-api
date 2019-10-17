/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const COAProjectAdmin = require('../../circles-of-angels-solidity/build/contracts/COAProjectAdmin.json');
const COAOracle = require('../../circles-of-angels-solidity/build/contracts/COAOracle.json');

const defaultAllowedAddreses = [
  '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
  '0x6704fbfcd5ef766b287262fa2281c105d57246a6',
  '0x9e1ef1ec212f5dffb41d35d9e5c14054f26c6560',
  '0xce42bdb34189a93c55de250e011c68faee374dd3',
  '0x97a3fc5ee46852c1cf92a97b7bad42f2622267cc',
  '0xb9dcbf8a52edc0c8dd9983fcc1d97b1f5d975ed7',
  '0x26064a2e2b568d9a6d01b93d039d1da9cf2a58cd',
  '0xe84da28128a48dd5585d1abb1ba67276fdd70776',
  '0xcc036143c68a7a9a41558eae739b428ecde5ef66',
  '0xe2b3204f29ab45d5fd074ff02ade098fbc381d42',
  '0xd51128f302755666c42e3920d72ff2fe632856a9'
];

module.exports = {
  server: {
    host: '104.237.154.167'
  },
  eth: {
    HTTP_HOST: process.env.HTTP_HOST || 'http://localhost:8545',
    WS_HOST: process.env.WS_HOST || 'ws://localhost:8545',
    MNEMONIC: process.env.MNEMONIC || false,
    CONTRACT_ADMIN_ADDRESS:
      process.env.PROJECT_ADMIN_ADDRESS ||
      COAProjectAdmin.networks['5777'].address,
    CONTRACT_ORACLE_ADDRESS:
      process.env.ORACLE_ADDRESS || COAOracle.networks['5777'].address,
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
    ALLOWED_ADDRESSES: JSON.parse(
      process.env.ALLOWED_ADDRESSES || defaultAllowedAddreses
    ),
    NUMBER_ACCOUNTS: 15,
    REINTENT_LAPSE: 780000,
    MAX_TX_ACCOUNT: 1
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://www.circlesofangels.org:3000'
};
