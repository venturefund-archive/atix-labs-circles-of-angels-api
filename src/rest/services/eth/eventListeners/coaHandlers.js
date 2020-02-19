const { coa } = require('@nomiclabs/buidler');
const logger = require('../../../logger');
const daoHandlers = require('./daoHandlers');
const { registerHandlers } = require('../../../util/listener');
// TODO: see if we can inject this service
const projectService = require('../../../services/projectService');
const { projectStatuses } = require('../../../util/constants');

module.exports = {
  DAOCreated: async address => {
    logger.info('[COA] :: Incoming event DAOCreated', address);
    const dao = await coa.getDao(address);
    registerHandlers(dao, daoHandlers);
  },
  ProjectCreated: async (id, address) => {
    const projectId = id.toNumber();
    logger.info('[COA] :: Incoming event ProjectCreated - address:', address);
    await projectService.updateProject(projectId, {
      status: projectStatuses.EXECUTING,
      address
    });
    logger.info(
      `[COA] :: Project ${projectId} status updated to ${
        projectStatuses.EXECUTING
      }`
    );
  }
};
