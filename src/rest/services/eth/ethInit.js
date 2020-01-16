const { coa } = require('@nomiclabs/buidler');
const handlers = require('./eventListeners/handlers');
const logger = require('../../logger');

exports.ethInit = async () => {
  logger.info('ethInit :: initializing eth');
  const contract = await coa.getCOA();
  registerEvents(contract, 'COA');
};

const registerEvents = (contract, contractName) => {
  logger.info(
    'registerEvents :: registering event listeners for contract',
    contractName
  );
  const eventMapping = {};
  const events = contract.interface.abi.filter(entry => entry.type === 'event');
  const eventNames = events.map(event => event.name);
  eventNames.forEach(event => {
    if (handlers[contractName][event]) {
      eventMapping[event] = handlers[contractName][event];
    }
  });
  Object.keys(eventMapping).forEach(key => contract.on(key, eventMapping[key]));
};
