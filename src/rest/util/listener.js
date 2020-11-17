const logger = require('../logger');

module.exports = {
  registerHandlers: (contract, contractHandlers) => {
    logger.info(
      '[RegisterHandlers] :: registering handlers',
      Object.keys(contractHandlers)
    );
    const eventMapping = {};
    const events = contract.interface.abi.filter(
      entry => entry.type === 'event'
    );
    const eventNames = events.map(event => event.name);
    eventNames.forEach(event => {
      if (contractHandlers[event]) {
        eventMapping[event] = contractHandlers[event];
      }
    });
    Object.keys(eventMapping).forEach(key =>
      contract.on(key, eventMapping[key])
    );
  }
};
