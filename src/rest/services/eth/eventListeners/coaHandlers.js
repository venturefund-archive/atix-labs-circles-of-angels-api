const logger = require('../../../logger');

module.exports = {
  DAOCreated: args => {
    // TODO: do this or remove if not needed
    logger.info('COA.DAOCreated', args);
  }
};
