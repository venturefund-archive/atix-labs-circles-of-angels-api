const { coa } = require('@nomiclabs/buidler');
const logger = require('../../../logger');
const daoHandlers = require('./daoHandlers');
const { registerHandlers } = require('../../../util/listener');

module.exports = {
  DAOCreated: async address => {
    logger.info('Incoming event :: [COA] DAOCreated', address);
    const dao = await coa.getDao(address);
    registerHandlers(dao, daoHandlers);
  }
};
