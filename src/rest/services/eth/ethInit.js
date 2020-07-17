const { coa } = require('@nomiclabs/buidler');
const { registerEvents } = require('../../util/events');
const logger = require('../../logger');

const ethInit = async () => {
  logger.info('ethInit :: initializing eth');
  const contract = await coa.getCOA();
  const registry = await coa.getRegistry();
  const daos = await coa.getDaos();
  for (let i = 0; i < daos.length; i++) {
    let currentAddress = await daos[i].address;
    let dao = await coa.getDaoContract(currentAddress);
    registerEvents(dao, 'DAO');
  }
  registerEvents(contract, 'COA');
  registerEvents(registry, 'ClaimsRegistry');
};

module.exports = {
  ethInit
};
