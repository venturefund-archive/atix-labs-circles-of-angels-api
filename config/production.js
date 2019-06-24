/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const COAProjectAdmin = require('../../circles-of-angels-solidity/build/contracts/COAProjectAdmin.json');
const COAOracle = require('../../circles-of-angels-solidity/build/contracts/COAOracle.json');

module.exports = {
  eth: {
    HTTP_HOST: 'http://localhost:4444',
    WS_HOST: 'ws://localhost:4445/websocket',
    CONTRACT_ADMIN_ADDRESS: COAProjectAdmin.networks['31'].address,
    CONTRACT_ORACLE_ADDRESS: COAOracle.networks['31'].address,
    MNEMONIC: 'mnemonic',
    CONTRACT_ADMIN_ABI: COAProjectAdmin.abi,
    CONTRACT_ORACLE_ABI: COAOracle.abi,
    DEFAULT_CONFIG: {
      defaultGas: 50000,
      defaultGasPrice: 1000000
    },
    UNLOCK_DURATION: 1000000,
    INITIAL_FUNDS: 10000000000000000,
    GAS_LIMIT: 6800000,
    ALLOWED_ADDRESSES: [
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
    ],
    NUMBER_ACCOUNTS: 20
  }
};
