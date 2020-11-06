const handlers = require('../services/eth/eventListeners/handlers');
const { registerHandlers } = require('./listener');
const { getImplContract, isProxy } = require('../../plugins/deployments');
const logger = require('../logger');

module.exports = {
  registerEvents: async (contract, contractName) => {
    logger.info(
      `[RegisterEvents] :: registering event listeners for contract ${contractName} ${
        contract.address
      }`
    );
    let finalContract = contract;
    if (await isProxy(contract)) {
      finalContract = await getImplContract(contract, contractName);
    }
    const contractHandlers = handlers[contractName];
    registerHandlers(finalContract, contractHandlers);
  }
};
