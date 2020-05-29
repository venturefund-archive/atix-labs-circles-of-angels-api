const { coa } = require('@nomiclabs/buidler');
const { registerEvents } = require('../../util/events');
const logger = require('../../logger');

const ethInit = async () => {
  logger.info('ethInit :: initializing eth');
  const contract = await coa.getCOA();
  const registry = await coa.getRegistry();
  const daos = await coa.getDaos();
  daos.forEach(async daoAddress => {
    const dao = await coa.getDaoContract(daoAddress);
    registerEvents(dao, 'DAO');
  });
  registerEvents(contract, 'COA');
  registerEvents(registry, 'ClaimsRegistry');
};

module.exports = {
  ethInit
};
