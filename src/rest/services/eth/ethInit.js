const { coa } = require('@nomiclabs/buidler');
const { registerEvents } = require('../../util/events');
const logger = require('../../logger');

const ethInit = async () => {
  logger.info('ethInit :: initializing eth');
  const contract = await coa.getCOA();
  const registry = await coa.getRegistry();
  const daos = await coa.getDaos();
  for (let i = 0; i < daos.length; i++) {
    const currentAddress = await daos[i].address;
    const dao = await coa.getDaoContract(currentAddress);
    await registerEvents(dao, 'DAO');
  }
  await registerEvents(contract, 'COA');
  await registerEvents(registry, 'ClaimsRegistry');
};

module.exports = {
  ethInit
};
