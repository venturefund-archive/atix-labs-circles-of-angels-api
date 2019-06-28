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
    HTTP_HOST: 'http://45.79.72.117:4444',
    WS_HOST: 'ws://localhost:4445/websocket',
    CONTRACT_ADMIN_ADDRESS: COAProjectAdmin.networks['31'].address,
    CONTRACT_ORACLE_ADDRESS: COAOracle.networks['31'].address,
    MNEMONIC:
      'hobby attract sight camp alone include coyote long gather proud light moral',
    CONTRACT_ADMIN_ABI: COAProjectAdmin.abi,
    CONTRACT_ORACLE_ABI: COAOracle.abi,
    DEFAULT_CONFIG: {
      defaultGas: 50000,
      defaultGasPrice: 1000000
    },
    UNLOCK_DURATION: 1000000,
    INITIAL_FUNDS: 10000000,
    GAS_LIMIT: 6800000,
    ALLOWED_ADDRESSES: [
      '0x6F9253f791c8CEc9Caa3DAA634329B9106ff5c5B',
      '0x2A87b73B4E1e7b7af22b0788Be514890280BE625',
      '0xf6F65A433FE3785515288Ae1052E5d1C421df399',
      '0x2a8D900aAe8A1C09Cec5F24C21b9c9F0BeEf0A38',
      '0x4A37e5277D1dCCc2e4f8389ef7d5B6e12b7b59F5',
      '0x5F2A0E8334f0a520525E1A181867423De7dBD07c',
      '0xCf63A758EB435E149C1015768bbaA86114Aa5CaD',
      '0xd9D562CD691e91A6618dB711dc47e4080D921B5B',
      '0x791BC1a71528290Dfa14fDc66B552fc70b4E9638',
      '0xB0840dEA00dc4BdcfAB235e897730854994c30E3',
      '0xBBFE7F78866B6f5ED253bD4E75bf08f157ED652c',
      '0xB30129f6d906c72d6e4125291bDbBC26eC719f00',
      '0x6E0672C70CC016D874f7d389cb7f3a29E7101F4B',
      '0x5FC8E5c55A50e1380B647Ef51090DE17477Bc873',
      '0x2B89016435E640749f6e792b900B6DbC3d38de86',
      '0xF527E72675a3A0Ce3f2399DD16543178376dBb17'
    ],
    NUMBER_ACCOUNTS: 20,
    REINTENT_LAPSE: 780000
  }
};
