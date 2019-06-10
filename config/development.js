const COAProjectAdmin = require('../../circle-of-angels-solidity/build/contracts/COAProjectAdmin.json');
const COAOracle = require('../../circle-of-angels-solidity/build/contracts/COAOracle.json');

module.exports = {
  eth: {
    HOST: 'ws://localhost:8545',
    CONTRACT_ADMIN_ADDRESS: COAProjectAdmin.networks['5777'].address,
    CONTRACT_ORACLE_ADDRESS: COAOracle.networks['5777'].address,
    CONTRACT_ADMIN_ABI: COAProjectAdmin.abi,
    CONTRACT_ORACLE_ABI: COAOracle.abi,
    DEFAULT_CONFIG: {
      defaultGas: 50000,
      defaultGasPrice: 1000000
    },
    UNLOCK_DURATION: 1000000,
    INITIAL_FUNDS: 10000000000000000,
    GAS_LIMIT: 10000000000
  }
};
